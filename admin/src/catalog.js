export const RESOURCES = {
  audio: {
    title: 'Audio stories',
    hint: 'Stories shown on the Audio page. Upload an audio file, or leave it empty and the site will read the text aloud.',
    fields: [
      { name: 'language', label: 'Language', required: true, placeholder: 'Gujarati' },
      { name: 'title', label: 'Title', required: true },
      { name: 'body', label: 'Story text', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number' },
      { name: 'audio', label: 'Audio file', type: 'file', accept: 'audio/*' },
    ],
    columns: ['language', 'title'],
  },
  ebooks: {
    title: 'eBooks',
    hint: 'Books shown in the eBook library. Add a cover image and a PDF.',
    fields: [
      { name: 'title', label: 'Title', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'sort_order', label: 'Order', type: 'number' },
      { name: 'cover', label: 'Cover image', type: 'file', accept: 'image/*' },
      { name: 'file', label: 'Book file (PDF)', type: 'file', accept: '.pdf,application/pdf' },
    ],
    columns: ['title'],
  },
  worksheets: {
    title: 'Worksheets',
    hint: 'Practice sheets by grade. Upload a PDF when you have one.',
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
    hint: 'Objective questions grouped by category on the GK page.',
    fields: [
      { name: 'category', label: 'Category', required: true, placeholder: 'Gujarat' },
      { name: 'question', label: 'Question', type: 'textarea', required: true },
      { name: 'answer', label: 'Answer', type: 'textarea', required: true },
      { name: 'sort_order', label: 'Order', type: 'number' },
    ],
    columns: ['category', 'question', 'answer'],
  },
  'spoken-english': {
    title: 'Spoken English',
    hint: 'Day-wise speaking lessons. Upload the audio students should hear.',
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
