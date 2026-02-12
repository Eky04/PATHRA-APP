import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const SYSTEM_PROMPT = `Kamu adalah AI Coach bernama PATHRA Coach, asisten kesehatan dan kebugaran yang ramah dan profesional. 
Tugas utamamu:
- Memberikan saran nutrisi, diet, dan pola makan sehat
- Memberikan tips olahraga dan kebugaran
- Memotivasi pengguna untuk hidup lebih sehat
- Menjawab pertanyaan terkait kesehatan secara umum

Aturan penting:
- Selalu jawab dalam Bahasa Indonesia
- Berikan jawaban yang informatif, ringkas, dan actionable (maksimal 3-4 paragraf)  
- Gunakan emoji secukupnya untuk membuat respons lebih menarik
- Jika ditanya hal di luar kesehatan/kebugaran, arahkan kembali ke topik kesehatan dengan sopan
- Jangan pernah memberikan diagnosis medis spesifik, sarankan untuk konsultasi ke dokter jika perlu
- Sertakan angka/data jika memungkinkan (kalori, porsi, durasi olahraga)`;

async function getUserId() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('pathra_session')?.value;
    return sessionId ? parseInt(sessionId) : null;
}

// GET — get or create current conversation, return messages
export async function GET() {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        let conversation = await prisma.coach_conversations.findFirst({
            where: { user_id: userId },
            orderBy: { started_at: 'desc' },
            include: {
                coach_messages: { orderBy: { created_at: 'asc' } },
            },
        });

        if (!conversation) {
            conversation = await prisma.coach_conversations.create({
                data: {
                    user_id: userId,
                    coach_messages: {
                        create: {
                            sender_type: 'ai',
                            content: 'Halo! 👋 Saya PATHRA Coach, asisten kesehatan dan kebugaran Anda. Saya bisa membantu Anda soal nutrisi, olahraga, diet, dan tips hidup sehat lainnya. Ada yang bisa saya bantu hari ini?',
                        },
                    },
                },
                include: {
                    coach_messages: { orderBy: { created_at: 'asc' } },
                },
            });
        }

        return NextResponse.json({
            conversationId: conversation.id,
            messages: conversation.coach_messages.map((msg) => ({
                id: msg.id,
                type: msg.sender_type,
                content: msg.content,
                timestamp: msg.created_at,
            })),
        });
    } catch (error) {
        console.error('Coach GET error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

// POST — send message and get AI response via Gemini
export async function POST(request: NextRequest) {
    try {
        const userId = await getUserId();
        if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { conversationId, content } = await request.json();

        // Save user message
        await prisma.coach_messages.create({
            data: {
                conversation_id: conversationId,
                sender_type: 'user',
                content,
            },
        });

        // Get conversation history for context (last 10 messages)
        const history = await prisma.coach_messages.findMany({
            where: { conversation_id: conversationId },
            orderBy: { created_at: 'asc' },
            take: 10,
        });

        // Generate AI response
        const aiContent = await generateGeminiResponse(content, history);

        const aiMessage = await prisma.coach_messages.create({
            data: {
                conversation_id: conversationId,
                sender_type: 'ai',
                content: aiContent,
            },
        });

        return NextResponse.json({
            userMessage: { content },
            aiMessage: {
                id: aiMessage.id,
                type: 'ai',
                content: aiContent,
                timestamp: aiMessage.created_at,
            },
        });
    } catch (error) {
        console.error('Coach POST error:', error);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

async function generateGeminiResponse(
    userMessage: string,
    history: { sender_type: string; content: string }[]
): Promise<string> {
    // If no API key, use enhanced fallback
    if (!process.env.GEMINI_API_KEY) {
        return generateFallbackResponse(userMessage);
    }

    try {
        // Build conversation history for Gemini
        const chatHistory = history.slice(0, -1).map((msg) => ({
            role: msg.sender_type === 'user' ? 'user' as const : 'model' as const,
            parts: [{ text: msg.content }],
        }));

        const modelsToTry = [
            'gemini-2.0-flash-lite-001',
            'gemini-2.0-flash',
            'gemini-flash-latest',
        ];

        let lastError: Error | null = null;

        for (const modelName of modelsToTry) {
            try {
                console.log(`[Coach] Trying model: ${modelName}`);
                const model = genAI.getGenerativeModel({
                    model: modelName,
                    systemInstruction: SYSTEM_PROMPT,
                });

                const chat = model.startChat({
                    history: chatHistory,
                });

                const result = await chat.sendMessage(userMessage);
                const response = await result.response;
                const text = response.text();

                if (text?.trim()) {
                    return text.trim();
                }
            } catch (error: any) {
                console.warn(`[Coach] Failed with ${modelName}: ${error.message}`);
                lastError = error;
            }
        }

        console.error('[Coach] All models failed:', lastError?.message);
        return generateFallbackResponse(userMessage);
    } catch (error) {
        console.error('[Coach] Gemini error:', error);
        return generateFallbackResponse(userMessage);
    }
}

function generateFallbackResponse(message: string): string {
    const msg = message.toLowerCase();

    const responses: { keywords: string[]; response: string }[] = [
        {
            keywords: ['capek', 'lelah', 'pegal', 'recovery', 'istirahat'],
            response: 'Kelelahan setelah olahraga itu normal! 💪 Beberapa tips recovery:\n\n1. **Tidur 7-8 jam** per malam untuk pemulihan otot\n2. **Minum air putih** minimal 2-3 liter/hari\n3. **Konsumsi protein** (telur, ayam, ikan) dalam 30 menit setelah olahraga\n4. **Stretching ringan** sebelum tidur\n\nJika kelelahan berlanjut lebih dari 2-3 hari, pertimbangkan untuk menurunkan intensitas latihan.',
        },
        {
            keywords: ['menu', 'makan', 'makanan', 'sarapan', 'makan siang', 'makan malam', 'resep'],
            response: 'Berikut contoh menu sehat sehari! 🥗\n\n**Sarapan (±400 cal):** Oatmeal + pisang + madu + kacang almond\n**Snack pagi:** Buah apel + yoghurt\n**Makan siang (±500 cal):** Nasi merah + ayam panggang + tumis brokoli\n**Snack sore:** Smoothie buah atau protein bar\n**Makan malam (±400 cal):** Ikan salmon + sayur bayam + kentang rebus\n\nTotal: ±1,500-1,800 cal. Sesuaikan porsi dengan kebutuhan kalori harian Anda!',
        },
        {
            keywords: ['nafsu', 'lapar', 'ngemil', 'craving', 'ngidam'],
            response: 'Tips mengendalikan nafsu makan berlebih: 🧠\n\n1. **Minum air putih** 1 gelas sebelum makan — ini mengurangi porsi hingga 20%\n2. **Makan berserat tinggi** (sayur, buah, oat) agar kenyang lebih lama\n3. **Hindari makanan ultra-processed** — ganti snack crackers dengan kacang rebus\n4. **Atur jadwal makan teratur** setiap 3-4 jam\n5. **Tidur cukup** — kurang tidur meningkatkan hormon lapar (ghrelin)\n\nKalau masih craving, coba makan buah yang manis seperti mangga atau semangka! 🍉',
        },
        {
            keywords: ['berat badan', 'turun', 'diet', 'kurus', 'langsing', 'gemuk', 'berat'],
            response: 'Untuk menurunkan berat badan secara sehat: ⚖️\n\n1. **Target deficit 500 cal/hari** = turun ±0.5kg per minggu\n2. **Hitung TDEE** (Total Daily Energy Expenditure) Anda dulu\n3. **Prioritaskan protein** — 1.6-2.2g per kg berat badan\n4. **Olahraga 3-4x/minggu** — kombinasi cardio + angkat beban\n5. **Jangan skip makan** — lebih baik porsi kecil tapi sering\n\n⚠️ Jangan diet ekstrem (< 1,200 cal/hari) karena bisa memperlambat metabolisme. Konsistensi > kecepatan!',
        },
        {
            keywords: ['olahraga', 'latihan', 'gym', 'fitness', 'lari', 'jogging', 'cardio'],
            response: 'Rekomendasi program olahraga mingguan: 🏋️\n\n**Senin:** Upper body (push-up, dumbbell press, shoulder press)\n**Selasa:** Cardio 30 menit (jogging/cycling)\n**Rabu:** Lower body (squat, lunges, deadlift)\n**Kamis:** Rest / stretching / yoga\n**Jumat:** Full body circuit training\n**Sabtu:** Cardio 30-45 menit\n**Minggu:** Active recovery (jalan santai, stretching)\n\nTips: Mulai dengan intensitas rendah jika baru memulai, naikkan bertahap setiap 1-2 minggu. Selalu pemanasan 5-10 menit sebelum latihan! 🔥',
        },
        {
            keywords: ['protein', 'nutrisi', 'vitamin', 'mineral', 'suplemen'],
            response: 'Panduan nutrisi dasar: 🍎\n\n**Makronutrien harian:**\n- Protein: 1.6-2.2g/kg BB (ayam, ikan, telur, tempe, tahu)\n- Karbohidrat: 45-65% dari total kalori (nasi merah, oat, ubi)\n- Lemak sehat: 20-35% (alpukat, kacang, minyak zaitun)\n\n**Mikronutrien penting:**\n- Vitamin D: 15 menit berjemur pagi\n- Zat besi: Bayam, daging merah\n- Kalsium: Susu, yoghurt, brokoli\n\nSuplemen hanya diperlukan jika asupan dari makanan kurang. Konsultasikan ke dokter terlebih dahulu! 💊',
        },
        {
            keywords: ['tidur', 'insomnia', 'susah tidur', 'begadang', 'ngantuk'],
            response: 'Tips tidur berkualitas untuk pemulihan optimal: 😴\n\n1. **Jadwal konsisten** — tidur dan bangun di jam yang sama setiap hari\n2. **Hindari layar** 1 jam sebelum tidur (blue light mengganggu melatonin)\n3. **Suhu ruangan** ideal 18-22°C\n4. **Hindari kafein** setelah jam 2 siang\n5. **Olahraga minimal 4 jam** sebelum tidur\n6. **Teknik relaksasi** — coba 4-7-8 breathing (tarik 4 detik, tahan 7, buang 8)\n\nTidur 7-9 jam sangat penting untuk recovery otot dan produksi growth hormone! 💤',
        },
    ];

    for (const r of responses) {
        if (r.keywords.some((k) => msg.includes(k))) {
            return r.response;
        }
    }

    return 'Pertanyaan yang menarik! 🤔 Sebagai AI Coach PATHRA, saya fokus membantu Anda dalam:\n\n• 🥗 **Nutrisi & diet** — menu sehat, kalori, makronutrien\n• 🏋️ **Olahraga** — program latihan, tips fitness\n• ⚖️ **Manajemen berat badan** — strategi penurunan/penambahan BB\n• 😴 **Recovery** — tips tidur, pemulihan otot\n\nCoba tanyakan salah satu topik di atas, dan saya akan berikan panduan yang lebih detail! 💪';
}
