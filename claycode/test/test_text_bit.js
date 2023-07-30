import { assert_eq, test_heading } from "./test_utils.js";

const relevant_strings = [
  "Hello World",

  "1234567890",
  "123 456 7890",
  "123.456.789,0",
  "123-456-789-0",

  "https://maida.me/treecode/",

  "Γειά σου Κόσμε", // Greek
  "こんにち は世界", // Japanese
  "Привет, мир", // Russian
  "头发、成为、发育", // Chinese (simplified)
  "頭髮、成為、發育", // Chinese (traditional)
  "سلام دنیا", // Persian
  "Გამარჯობა მსოფლიო", // Georgian
  "हैलो वर्ल्ड", // Hindi

  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()-_=+[]{};:'\",./?<>\\|`~", // Basic Latin characters (ASCII)
  "ÁáÉéÍíÓóÚúÑñÜüß", // Latin-1 Supplement (ISO-8859-1) characters
  "ãăāäåæçĉďēĕěęĝģĥħīĭįıĳķĺļŀłņňŋōŏøœŕřśŝşţťŧūŭůųŵŷźżſĀĂĄĆĈĊČĎĐĒĔĖĘĚĜĞĠĢĤĦĨĪĬĮİĲĴĶĹĻĽĿŁŃŅŇŊŌŎŐŒŔŖŘŚŜŞŢŤŦŨŪŬŮŰŲŴŶŹŻ", // Diacritics and Accents
  "АаБбВвГгДдЕеЁёЖжЗзИиЙйКкЛлМмНнОоПпРрСсТтУуФфХхЦцЧчШшЩщЪъЫыЬьЭэЮюЯя", // Cyrillic characters
  "ΑαΒβΓγΔδΕεΖζΗηΘθΙιΚκΛλΜμΝνΞξΟοΠπΡρΣσςΤτΥυΦφΧχΨψΩω", // Greek characters
  "אבגדהווזחטיכךלמםנןסעפףצץקרשת", // Hebrew characters
  "ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي", // Arabic characters
  "你好世界汉字字体简体繁體", // Chinese characters (Simplified and Traditional)
  "こんにちはさようならありがとうおはようおやすみすし初音ミク漢字ひらがなカタカナ", // Japanese characters (Hiragana, Katakana, Kanji)
  "안녕하세요감사합니다사랑해요한글", // Korean characters (Hangul)
  "สวัสดีขอบคุณสวัสดีครับไทยภาษาไทย", // Thai characters
  "नमस्तेधन्यवादसंस्कृतहिन्दी", // Devanagari characters (used in Hindi, Sanskrit, and other languages)

  "©®™°±√π∞≠≤≥☺☹❤☀☁☂☃", // Special Symbols and Emoji
  "+−×÷=<>%^~|∑∫∆∇√≈≠≤≥", // Mathematical symbols
  "1234567890$€£¥₹₽", // Currency symbols
  "🌟🎉🚀📚🎵🎮🏆", // Miscellaneous
];

// Test UTF8 Encoder
import * as text_bit_UTF8 from "../conversion/text_bits/text_bits_UTF8.js";
try {
  test_heading("Text-Bit Encoding: UTF8");
  for (const string of relevant_strings) {
    assert_eq(
      string,
      text_bit_UTF8.bitsToText(text_bit_UTF8.textToBits(string))
    );
  }
} catch (error) {
  console.error(`TEST FAILED: ${error}`);
}
