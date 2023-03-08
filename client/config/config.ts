const lang2label: { [key: string]: string } = {
  hi: "Hindi",
  ta: "Tamil",
  en: "English",
  te: "Telugu",
  as: "Assamese",
  bn: "Bengali",
  kn: "Kannada",
  ml: "Malayalam",
  mr: "Marathi",
  pa: "Punjabi",
  or: "Oriya",
  gu: "Gujarati",
  raj: "Rajasthani",
  ur: "Urdu",
  sa: "Sanskrit",
  brx: "Bodo",
  mni: "Manipuri",
};

const tag2Color = {
  "B-LOC": ["#ffcccc", "#ff0000"],
  "B-ORG": ["#cceeff", "#00aaff"],
  "B-PER": ["#d6f5d6", "#33cc33"],
  "I-LOC": ["#ffccdd", "#ff0055"],
  "I-ORG": ["#ffffcc", "#ffff00"],
  "I-PER": ["#e6ccff", "#8000ff"],
  O: ["#ffe6cc", "#ff8000"],
};

export { lang2label, tag2Color };
