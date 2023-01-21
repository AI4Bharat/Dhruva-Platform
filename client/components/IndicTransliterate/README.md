<h1 align="center">Indic Transliterate</h1>

Transliteration component for React with support for 21 Indic languages. Uses API from [AI4Bharat IndicXlit](https://ai4bharat.org/transliteration).

[![NPM](https://img.shields.io/npm/v/@ai4bharat/indic-transliterate.svg)](https://www.npmjs.com/package/@ai4bharat/indic-transliterate)

<p align="center">
<img src="./assets/hi.gif"></img>
</p>

## Table of contents

<!-- TOC -->

- [1. About](#1-about)
- [2. Demo](#2-demo)
- [3. Install](#3-install)
- [4. Usage](#4-usage)
    - [4.1. Basic example](#41-basic-example)
    - [4.2. With custom component](#42-with-custom-component)
    - [4.3. With TypeScript](#43-with-typescript)
    - [4.4. With Material-UI](#44-with-material-ui)
- [5. Get transliteration suggestions](#5-get-transliteration-suggestions)
    - [5.1. Standalone Example](#51-standalone-example)
    - [5.2. Custom trigger keys](#52-custom-trigger-keys)
    - [5.3. Props](#53-props)
- [6. Languages](#6-languages)
    - [6.1. Get supported languages](#61-get-supported-languages)
    - [6.2. List of language codes](#62-list-of-language-codes)
- [7. License](#7-license)

<!-- /TOC -->

## 1. About

This is a frontend library to enable your users to type in many different languages of South Asia, and can be integrated into any React-based application. This library is a fork of [react-transliterate](https://www.npmjs.com/package/react-transliterate), which uses Google Transliterate API which supports around 40 languages across the globe. In this module, our focus is to provide high-quality transliteration-suggestions for Indic languages, especially for low-resource languages like Kashmiri, Manipuri, etc. (which are not supported by Google). For more details about the AI system behind this, please check [AI4Bhārat Indic-Xlit](https://ai4bharat.org/indic-xlit).

## 2. Demo

**[Click-here to try our demo!](https://ai4bharat.github.io/indic-transliterate-js/)**

Source of this demo is available in the [`example` folder](https://github.com/AI4Bharat/indic-transliterate-js/tree/master/example) of the repo.

## 3. Install

```bash
npm install --save @ai4bharat/indic-transliterate

OR

yarn add @ai4bharat/indic-transliterate
```

## 4. Usage

### 4.1. Basic example

```jsx
import React, { useState } from "react";

import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import "@ai4bharat/indic-transliterate/dist/index.css";

const App = () => {
  const [text, setText] = useState("");

  return (
    <IndicTransliterate
      value={text}
      onChangeText={(text) => {
        setText(text);
      }}
      lang="hi"
    />
  );
};

export default App;
```

### 4.2. With custom component

```jsx
import React, { useState } from "react";

import { IndicTransliterate } from "@ai4bharat/indic-transliterate";
import "@ai4bharat/indic-transliterate/dist/index.css";

const App = () => {
  const [text, setText] = useState("");

  return (
    <IndicTransliterate
      renderComponent={(props) => <textarea {...props} />}
      value={text}
      onChangeText={(text) => {
        setText(text);
      }}
      lang="hi"
    />
  );
};

export default App;
```

### 4.3. With TypeScript

```tsx
import React, { useState } from "react";

import { IndicTransliterate, Language } from "@ai4bharat/indic-transliterate";
import "@ai4bharat/indic-transliterate/dist/index.css";

const App = () => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState<Language>("hi");

  return (
    <IndicTransliterate
      renderComponent={(props) => <textarea {...props} />}
      value={text}
      onChangeText={(text) => {
        setText(text);
      }}
      lang={lang}
    />
  );
};

export default App;
```

### 4.4. With Material-UI

```tsx
import React, { useState } from "react";

import { IndicTransliterate, Language } from "@ai4bharat/indic-transliterate";
import "@ai4bharat/indic-transliterate/dist/index.css";

import Input from "@material-ui/core/Input";

const App = () => {
  const [text, setText] = useState("");
  const [lang, setLang] = useState<Language>("hi");

  return (
    <IndicTransliterate
      renderComponent={(props) => {
        const inputRef = props.ref;
        delete props["ref"];
        return <Input {...props} inputRef={inputRef} />;
      }}
      value={text}
      onChangeText={(text) => {
        setText(text);
      }}
      lang={lang}
    />
  );
};

export default App;
```

## 5. Get transliteration suggestions

### 5.1. Standalone example

```jsx
import { getTransliterateSuggestions } from "@ai4bharat/indic-transliterate";

const data = await getTransliterateSuggestions(
  word, // word to fetch suggestions for
  {
    numOptions: 5, // number of suggestions to fetch
    showCurrentWordAsLastSuggestion: true, // add the word as the last suggestion
    lang: "hi", // target language
  },
);
```

### 5.2. Custom trigger keys

Keys which when pressed, input the current selection to the textbox

Indic Transliterate uses the `event.keycode` property to detect keys. Here are some predefined keys you can use. Or, you can enter the integer codes for any other key you'd like to use as the trigger

```jsx
import React, { useState } from "react";

import { IndicTransliterate, TriggerKeys } from "@ai4bharat/indic-transliterate";
import "@ai4bharat/indic-transliterate/dist/index.css";

import Input from "@material-ui/core/Input";

const App = () => {
  const [text, setText] = useState("");

  return (
    <IndicTransliterate
      value={text}
      onChangeText={(text) => {
        setText(text);
      }}
      lang="hi"
      triggerKeys={[
        TriggerKeys.KEY_RETURN,
        TriggerKeys.KEY_ENTER,
        TriggerKeys.KEY_SPACE,
        TriggerKeys.KEY_TAB,
      ]}
    />
  );
};

export default App;
```

### 5.3. Props

| Prop                             | Required? | Default                                     | Description                                                                                                                          |
| -------------------------------- | --------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| onChangeText                     | Yes       |                                             | Listener for the current value from the component. `(text: string) => void`                                                          |
| value                            | Yes       |                                             | `value` prop to pass to the component                                                                                                |
| enabled                          |           | true                                        | Control whether suggestions should be shown                                                                                          |
| renderComponent                  |           | `(props) => <input {...props} />`           | Component to render. You can pass components from your component library as this prop                                                |
| lang                             |           | hi                                          | Language you want to transliterate. See the following section for language codes                                                     |
| maxOptions                       |           | 5                                           | Maximum number of suggestions to show in helper                                                                                      |
| offsetY                          |           | 0                                           | Extra space between the top of the helper and bottom of the caret                                                                    |
| offsetX                          |           | 0                                           | Extra space between the caret and left of the helper                                                                                 |
| containerClassName               |           | empty string                                | Classname passed to the container of the component                                                                                   |
| containerStyles                  |           | {}                                          | CSS styles object passed to the container                                                                                            |
| activeItemStyles                 |           | {}                                          | CSS styles object passed to the active item `<li>` tag                                                                               |
| hideSuggestionBoxOnMobileDevices |           | `false`                                     | Should the suggestions be visible on mobile devices since keyboards like Gboard and Swiftkey support typing in multiple languages    |
| hideSuggestionBoxBreakpoint      |           | 450                                         | type: `number`. To be used when `hideSuggestionBoxOnMobileDevices` is true. Suggestion box will not be shown below this device width |
| triggerKeys                      |           | `KEY_SPACE, KEY_ENTER, KEY_TAB, KEY_RETURN` | Keys which when pressed, input the current selection to the textbox                                                                  |
| insertCurrentSelectionOnBlur     |           | `true`                                      | Should the current selection be inserted when `blur` event occurs                                                                    |
| showCurrentWordAsLastSuggestion  |           | `true`                                      | Show current input as the last option in the suggestion box                                                                          |

## 6. Languages

### 6.1. Get supported languages

```jsx
import { getTransliterationLanguages } from "@ai4bharat/indic-transliterate";

const data = await getTransliterationLanguages();
```

### 6.2. List of language codes

Currently supports the following 21 languages from the Indian subcontinent:

|ISO 639 code | Language |
|---|--------------------|
|as |Assamese - অসমীয়া   |
|bn |Bangla - বাংলা       |
|brx|Boro - बड़ो	      |
|gu |Gujarati - ગુજરાતી   |
|hi |Hindi - हिंदी         |
|kn |Kannada - ಕನ್ನಡ     |
|ks |Kashmiri - كٲشُر 	  |
|gom|Konkani Goan - कोंकणी|
|mai|Maithili - मैथिली     |
|ml |Malayalam - മലയാളം|
|mni|Manipuri - ꯃꯤꯇꯩꯂꯣꯟ	 |
|mr |Marathi - मराठी       |
|ne |Nepali - नेपाली 	    |
|or |Oriya - ଓଡ଼ିଆ         |
|pa |Panjabi - ਪੰਜਾਬੀ      |
|sa |Sanskrit - संस्कृतम् 	 |
|sd |Sindhi - سنڌي       |
|si |Sinhala - සිංහල     |
|ta |Tamil - தமிழ்       |
|te |Telugu - తెలుగు      |
|ur |Urdu - اُردُو         |

## 7. License

MIT © [ai4bharat](https://github.com/AI4Bharat) 

Sincere thanks to [burhanuday](https://github.com/burhanuday/react-transliterate) for making his work open-source!
