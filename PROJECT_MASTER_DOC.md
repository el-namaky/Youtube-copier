# YouTube Copier - Project Master Documentation

## 1. نبذة عن المشروع (Project Overview)
**YouTube Copier** هو تطبيق متقدم لمعالجة الفيديوهات يهدف إلى أتمتة عملية إنشاء المحتوى. يتيح التطبيق للمستخدمين استيراد فيديوهات من يوتيوب (قوائم تشغيل أو قنوات)، ومعالجتها عبر "محرر سير عمل" (Workflow Editor) يعتمد على العقد (Nodes).

**الهدف الرئيسي:** تحويل المحتوى الأجنبي إلى محتوى محلي (مترجم، معدل، ومنسق) بسهولة وسرعة.

---

## 2. الوظائف الرئيسية (Key Functions)

### محرر سير العمل (Workflow Editor)
هو القلب النابض للتطبيق، حيث يقوم المستخدم ببناء خطة المعالجة عن طريق ربط العقد ببعضها.
*   **Source Node**: تحديد المصدر (رابط يوتيوب)، مجلد الإخراج، وترتيب التحميل.
*   **Download Node**: تحميل الفيديو والصوت.
*   **Transcribe & Translate Nodes**: استخراج النص وترجمته مع دعم تشكيل اللغة العربية.
*   **Edit Node**: قص الفيديو (Trim)، إضافة فواصل إعلانية (Inserts)، والتحكم في الصوت.
*   **Merge Node**: دمج المسارات المختلفة (فيديو، صوت، ترجمة) مع التحكم في التوقيت (Start Times).
*   **Render Node**: تصدير الفيديو النهائي.

### لوحة التحكم (Dashboard)
*   تعرض إحصائيات المشاريع (النشطة، المكتملة).
*   تعرض قائمة المشاريع الحالية وحالتها (Processing, Completed).
*   يتم حفظ المشاريع محلياً (Local Storage) لمحاكاة العمل الحقيقي حالياً.

---

## 3. الجوانب التقنية (Technical Aspects)

### الواجهة الأمامية (Frontend)
*   **Framework**: React (Vite).
*   **Styling**: Tailwind CSS + Pure CSS (Glassmorphism design).
*   **Create Graph**: `@xyflow/react` (React Flow) لبناء المحرر الرسومي.
*   **Icons**: `lucide-react`.
*   **Animations**: `framer-motion`.

### الواجهة الخلفية (Backend) - *قيد التطوير*
*   **Language**: Python.
*   **Framework**: FastAPI.
*   **Database**: (مخطط له) SQLite/PostgreSQL.
*   **Video Processing**: FFmpeg (عبر Python wrapper).
*   **AI**: OpenAI API / Google Gemini للترجمة والتحليل.

---

## 4. فهرس الملفات (Directory Structure)

```
h:/projectapp/youtube copier/
├── src/
│   ├── components/
│   │   ├── workflow/           # مكونات محرر العقد
│   │   │   ├── Sidebar.tsx     # القائمة الجانبية للعقد
│   │   │   ├── WorkflowBuilder.tsx # اللوحة الرئيسية (Canvas)
│   │   │   └── inspector/      # خصائص العقد (Property Inspector)
│   ├── pages/
│   │   ├── Dashboard.tsx       # الصفحة الرئيسية
│   │   └── NewProject.tsx      # صفحة إنشاء مشروع جديد
│   └── services/
│       └── api.ts              # الاتصال بالخلفية (Mocked currently)
├── backend/                    # كود السيرفر (Python)
└── [Documentation Files]       # سيتم حذفها واستبدالها بهذا الملف
```

---

## 5. تعليمات التشغيل (How to Run)

1.  **تشغيل الواجهة**:
    ```bash
    npm run dev
    ```
2.  **بناء المشروع**:
    ```bash
    npm run build
    ```
-------------------------------------------------------------------








{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{{
## الخطوة التالية في تطوير المشروع 
في نود التحميل يجب وضع رابط الفيديو او صفحة الشورتس وايضا زر لاختيار مكان مجلد المشروع الحالي
في نود استخراج السبتايتل سنساخدم مكتبة yt-dlp لاستخراج السبتايتل في json
في نود الترجمة اضف ترجمة جوجل القديمة المجانية للقائمة وتأكد من تكامل وظائف النود مثل البرومبت وعمل ال api
في نود توليد الصوت تأكد ان سير العمل مع evenlabs متكامل واحترافي
تخصيصات نود الدمج هي تحديد موقع بدء وانتها مدخلات لضبط مواقيت المواد للفيديو النهائي من صوت مولد سب تايتل مترجم وفيديو