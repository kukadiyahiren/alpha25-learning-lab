export const RESOURCES = {
  audio: {
    title: 'Audio stories',
    hint: 'Stories shown on the Audio page. Upload an audio file, or leave it empty and the site will read the text aloud.',
    bulk: {
      columns: ['language', 'title', 'body', 'sort_order'],
      sample: 'audio-stories-sample.csv',
      samples: [
        ['Gujarati', 'નાની ચકલીની હિંમત', 'એક નાની ચકલી વૃક્ષ પર રહેતી હતી. તે દરરોજ વહેલી સવારે ઊડતી હતી.', 1],
        ['Hindi', 'मेहनती खरगोश', 'यह हिंदी कहानी का नमूना है. मेहनत से हर काम पूरा होता है.', 2],
        ['English', 'The Helpful Little Star', 'A little star helped the night sky shine. Kindness made everyone brighter.', 3],
      ],
      note: 'Audio files are not imported from the sheet; add those later with Edit if needed.',
    },
    fields: [
      { name: 'language', label: 'Language', placeholder: 'Gujarati' },
      { name: 'title', label: 'Title' },
      { name: 'body', label: 'Story text', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number' },
      { name: 'audio', label: 'Audio file', type: 'file', accept: 'audio/*' },
    ],
    columns: ['language', 'title'],
  },
  ebooks: {
    title: 'eBooks',
    hint: 'Add a title and upload a PDF (up to 50 MB). Cover is optional — if you skip it, a colorful cover is created from the title automatically.',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number' },
      { name: 'cover', label: 'Cover image (optional)', type: 'file', accept: 'image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp' },
      { name: 'file', label: 'Book file (PDF)', type: 'file', accept: '.pdf,application/pdf', required: true, maxMb: 50 },
    ],
    columns: ['title'],
  },
  worksheets: {
    title: 'Worksheets',
    hint: 'Practice sheets by grade. Upload a PDF when you have one.',
    bulk: {
      columns: ['grade', 'title', 'description', 'sort_order'],
      sample: 'worksheets-sample.csv',
      samples: [
        ['1', 'ધોરણ 1 practice', 'ગુજરાતી • ગણિત • English', 1],
        ['2', 'ધોરણ 2 practice', 'ગુજરાતી • ગણિત • English', 2],
        ['3', 'ધોરણ 3 practice', 'ગુજરાતી • ગણિત • English • GK', 3],
      ],
      note: 'PDF files are not imported from the sheet; attach them later with Edit if needed.',
    },
    fields: [
      { name: 'grade', label: 'Grade', required: true, placeholder: '1' },
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number' },
      { name: 'file', label: 'Worksheet file', type: 'file', accept: '.pdf,application/pdf' },
    ],
    columns: ['grade', 'title'],
  },
  gk: {
    title: 'GK questions',
    hint: 'Objective questions with multiple-choice options. Mark the correct answer in the Answer field.',
    bulk: {
      columns: ['category', 'question', 'answer', 'option_1', 'option_2', 'option_3', 'option_4', 'sort_order'],
      sample: 'gk-questions-sample.csv',
      samples: [
        ['Gujarat', 'ગુજરાતની રાજધાની કઈ છે?', 'ગાંધીનગર', 'અમદાવાદ', 'ગાંધીનગર', 'સુરત', 'રાજકોટ', 1],
        ['India', 'ભારતની રાજધાની કઈ છે?', 'નવી દિલ્હી', 'મુંબઈ', 'નવી દિલ્હી', 'કોલકાતા', 'ચેન્નઈ', 2],
        ['World', 'પૃથ્વીનો ઉપગ્રહ કયો છે?', 'ચંદ્ર', 'સૂર્ય', 'મંગળ', 'ચંદ્ર', 'શુક્ર', 3],
      ],
      note: 'One question per row. Fill option_1…option_4 for multiple choice. Answer must match the correct option.',
    },
    fields: [
      { name: 'category', label: 'Category', required: true, placeholder: 'Gujarat' },
      { name: 'question', label: 'Question', type: 'textarea', required: true },
      { name: 'options', label: 'Answer options', type: 'options', hint: 'Add 2–4 choices students can pick from.' },
      { name: 'answer', label: 'Correct answer', type: 'textarea', required: true, placeholder: 'Must match one option text' },
      { name: 'sort_order', label: 'Order', type: 'number' },
    ],
    columns: ['category', 'question', 'answer'],
  },
  'spoken-english': {
    title: 'Spoken English',
    hint: 'Day-wise speaking lessons. Upload the audio students should hear.',
    bulk: {
      columns: ['day_label', 'topic', 'script', 'sort_order'],
      sample: 'spoken-english-sample.csv',
      samples: [
        ['Day 1', 'Greetings', 'Good morning. How are you? I am fine, thank you.', 1],
        ['Day 2', 'Introduction', 'My name is Rajnish. I am happy to meet you.', 2],
        ['Day 3', 'Classroom', 'Please open your book. Listen carefully. Repeat after me.', 3],
      ],
      note: 'Audio files are not imported from the sheet; add those later with Edit if needed.',
    },
    fields: [
      { name: 'day_label', label: 'Day', required: true, placeholder: 'Day 1' },
      { name: 'topic', label: 'Topic', required: true },
      { name: 'script', label: 'Script', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number' },
      { name: 'audio', label: 'Audio file', type: 'file', accept: 'audio/*' },
    ],
    columns: ['day_label', 'topic'],
  },
  phonics: {
    title: 'Phonics',
    hint: 'Letter and word cards. Upload the sound students hear.',
    bulk: {
      columns: ['day_label', 'letter', 'word', 'sort_order'],
      sample: 'phonics-sample.csv',
      samples: [
        ['Day 1', 'A a', 'apple', 1],
        ['Day 2', 'B b', 'ball', 2],
        ['Day 3', 'C c', 'cat', 3],
      ],
      note: 'Audio files are not imported from the sheet; add those later with Edit if needed.',
    },
    fields: [
      { name: 'day_label', label: 'Day', required: true, placeholder: 'Day 1' },
      { name: 'letter', label: 'Letter', required: true, placeholder: 'A a' },
      { name: 'word', label: 'Word', required: true, placeholder: 'apple' },
      { name: 'sort_order', label: 'Order', type: 'number' },
      { name: 'audio', label: 'Hear audio', type: 'file', accept: 'audio/*' },
    ],
    columns: ['day_label', 'letter', 'word'],
  },
};
