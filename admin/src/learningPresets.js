/** Display title stays short (e.g. "1 to 10"); body is what TTS speaks. */

const GU_NUMBERS = [
  '', 'એક', 'બે', 'ત્રણ', 'ચાર', 'પાંચ', 'છ', 'સાત', 'આઠ', 'નવ', 'દસ',
  'અગિયાર', 'બાર', 'તેર', 'ચૌદ', 'પંદર', 'સોળ', 'સત્તર', 'અઢાર', 'ઓગણીસ', 'વીસ',
  'એકવીસ', 'બાવીસ', 'તેવીસ', 'ચોવીસ', 'પચ્ચીસ', 'છવ્વીસ', 'સત્તાવીસ', 'અઠ્ઠાવીસ', 'ઓગણત્રીસ', 'ત્રીસ',
  'એકત્રીસ', 'બત્રીસ', 'તેત્રીસ', 'ચોત્રીસ', 'પાંત્રીસ', 'છત્રીસ', 'સડત્રીસ', 'અડત્રીસ', 'ઓગણચાલીસ', 'ચાલીસ',
  'એકતાલીસ', 'બેતાલીસ', 'ત્રેતાલીસ', 'ચુંમાલીસ', 'પિસ્તાલીસ', 'છેતાલીસ', 'સુડતાલીસ', 'અડતાલીસ', 'ઓગણપચાસ', 'પચાસ',
  'એકાવન', 'બાવન', 'ત્રેપન', 'ચોપન', 'પંચાવન', 'છપ્પન', 'સત્તાવન', 'અઠ્ઠાવન', 'ઓગણસાઠ', 'સાઠ',
  'એકસઠ', 'બાસઠ', 'ત્રેસઠ', 'ચોસઠ', 'પાંસઠ', 'છાસઠ', 'સડસઠ', 'અડસઠ', 'ઓગણસિત્તેર', 'સિત્તેર',
  'એકોતેર', 'બોતેર', 'તોતેર', 'ચુંમોતેર', 'પંચોતેર', 'છોતેર', 'સિત્તોતેર', 'ઇઠ્ઠોતેર', 'ઓગણએંસી', 'એંસી',
  'એક્યાસી', 'બ્યાસી', 'ત્યાસી', 'ચોર્યાસી', 'પંચ્યાસી', 'છ્યાસી', 'સિત્યાસી', 'ઈઠ્યાસી', 'નેવ્યાસી', 'નેવું',
  'એકાણું', 'બાણું', 'ત્રાણું', 'ચોરાણું', 'પંચાણું', 'છન્નું', 'સત્તાણું', 'અઠ્ઠાણું', 'નવ્વાણું', 'સો',
];

const GU_SWAR = ['અ', 'આ', 'ઇ', 'ઈ', 'ઉ', 'ઊ', 'એ', 'ઐ', 'ઓ', 'ઔ', 'અં', 'અઃ'];
const GU_VYANJAN = [
  'ક', 'ખ', 'ગ', 'ઘ', 'ચ', 'છ', 'જ', 'ઝ',
  'ટ', 'ઠ', 'ડ', 'ઢ', 'ણ', 'ત', 'થ', 'દ', 'ધ', 'ન',
  'પ', 'ફ', 'બ', 'ભ', 'મ', 'ય', 'ર', 'લ', 'વ', 'શ', 'ષ', 'સ', 'હ', 'ળ', 'ક્ષ', 'જ્ઞ',
];

const GU_MATRAS = [
  { mark: '', label: 'અ' },
  { mark: 'ા', label: 'આ' },
  { mark: 'િ', label: 'ઇ' },
  { mark: 'ી', label: 'ઈ' },
  { mark: 'ુ', label: 'ઉ' },
  { mark: 'ૂ', label: 'ઊ' },
  { mark: 'ે', label: 'એ' },
  { mark: 'ૈ', label: 'ઐ' },
  { mark: 'ો', label: 'ઓ' },
  { mark: 'ૌ', label: 'ઔ' },
  { mark: 'ં', label: 'અં' },
  { mark: 'ઃ', label: 'અઃ' },
];

function guNumbers(from, to) {
  const words = [];
  for (let n = from; n <= to; n += 1) {
    words.push(GU_NUMBERS[n] || String(n));
  }
  return words.join(', ');
}

function englishLetters(fromChar, toChar) {
  const start = fromChar.toUpperCase().charCodeAt(0);
  const end = toChar.toUpperCase().charCodeAt(0);
  const letters = [];
  for (let code = start; code <= end; code += 1) {
    letters.push(String.fromCharCode(code));
  }
  return letters.join(' ');
}

function barakhadi(base) {
  return GU_MATRAS.map(({ mark }) => `${base}${mark}`).join(' ');
}

/** Presets shown in Admin → Audio when building Learning content. */
export const LEARNING_PRESETS = [
  {
    id: 'gu-kakko-swar',
    label: 'ગુજરાતી કક્કો — સ્વર',
    apply: () => ({
      section: 'learning',
      language: 'Gujarati',
      title: 'ગુજરાતી કક્કો (સ્વર)',
      body: GU_SWAR.join(' '),
      sort_order: 1,
    }),
  },
  {
    id: 'gu-kakko-vyanjan',
    label: 'ગુજરાતી કક્કો — વ્યંજન',
    apply: () => ({
      section: 'learning',
      language: 'Gujarati',
      title: 'ગુજરાતી કક્કો (વ્યંજન)',
      body: GU_VYANJAN.join(' '),
      sort_order: 2,
    }),
  },
  {
    id: 'gu-barakhadi-ka',
    label: 'બારાખડી — ક',
    apply: () => ({
      section: 'learning',
      language: 'Gujarati',
      title: 'બારાખડી (ક)',
      body: barakhadi('ક'),
      sort_order: 3,
    }),
  },
  ...Array.from({ length: 10 }, (_, index) => {
    const from = index * 10 + 1;
    const to = (index + 1) * 10;
    return {
      id: `gu-num-${from}-${to}`,
      label: `ગુજરાતી અંક ${from}–${to}`,
      apply: () => ({
        section: 'learning',
        language: 'Gujarati',
        title: `${from} to ${to}`,
        body: guNumbers(from, to),
        sort_order: 10 + index,
      }),
    };
  }),
  {
    id: 'en-az',
    label: 'English A to Z',
    apply: () => ({
      section: 'learning',
      language: 'English',
      title: 'A to Z',
      body: englishLetters('A', 'Z'),
      sort_order: 30,
    }),
  },
  {
    id: 'en-a-m',
    label: 'English A to M',
    apply: () => ({
      section: 'learning',
      language: 'English',
      title: 'A to M',
      body: englishLetters('A', 'M'),
      sort_order: 31,
    }),
  },
  {
    id: 'en-n-z',
    label: 'English N to Z',
    apply: () => ({
      section: 'learning',
      language: 'English',
      title: 'N to Z',
      body: englishLetters('N', 'Z'),
      sort_order: 32,
    }),
  },
];
