var $dWhh5$reactjsxruntime = require("react/jsx-runtime");
var $dWhh5$react = require("react");
var $dWhh5$textareacaret = require("textarea-caret");

function $parcel$interopDefault(a) {
    return a && a.__esModule ? a.default : a;
}
function $parcel$export(e, n, v, s) {
    Object.defineProperty(e, n, { get: v, set: s, enumerable: true, configurable: true });
}

$parcel$export(module.exports, "IndicTransliterate", () => $3f93eb6d5bf69cb7$export$a62758b764e9e41d);
$parcel$export(module.exports, "TriggerKeys", () => $9090cd5fdacb9284$export$24b0ea3375909d37);
$parcel$export(module.exports, "getTransliterateSuggestions", () => $ad7f01abe8daa1b6$export$27f30d10c00bcc6c);
$parcel$export(module.exports, "getTransliterationLanguages", () => $bb5a013037ca2153$export$58f2e270169de9d3);



function $6a2317d46b969b19$export$e27e3030245d4c9b() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
}


function $94c75e1d9a9e24f0$export$8a4ff65f970d59a5(el) {
    const start = 0;
    const end = 0;
    if (!el) return {
        start: start,
        end: end
    };
    if (typeof el.selectionStart === "number" && typeof el.selectionEnd === "number") return {
        start: el.selectionStart,
        end: el.selectionEnd
    };
    return {
        start: start,
        end: end
    };
}
function $94c75e1d9a9e24f0$export$97ab23b40042f8af(elem, caretPos) {
    if (elem) {
        if (elem.selectionStart) {
            elem.focus();
            elem.setSelectionRange(caretPos, caretPos);
        } else elem.focus();
    }
}





var $479169a4406ef977$exports = {};

$parcel$export($479169a4406ef977$exports, "ReactTransliterate", () => $479169a4406ef977$export$b7fa6c785ac95e64, (v) => $479169a4406ef977$export$b7fa6c785ac95e64 = v);
$parcel$export($479169a4406ef977$exports, "Active", () => $479169a4406ef977$export$c3c7cbf43a3f0561, (v) => $479169a4406ef977$export$c3c7cbf43a3f0561 = v);
var $479169a4406ef977$export$b7fa6c785ac95e64;
var $479169a4406ef977$export$c3c7cbf43a3f0561;
$479169a4406ef977$export$b7fa6c785ac95e64 = "_ReactTransliterate_1b0d4b";
$479169a4406ef977$export$c3c7cbf43a3f0561 = "_Active_1b0d4b";


const $9090cd5fdacb9284$export$24b0ea3375909d37 = {
    KEY_RETURN: "Enter",
    KEY_ENTER: "Enter",
    KEY_TAB: "Tab",
    KEY_SPACE: " "
};


const $905ee54827307cc1$export$ca6dda5263526f75 = "https://xlit-api.ai4bharat.org/";


const $ad7f01abe8daa1b6$export$27f30d10c00bcc6c = async (word, config) => {
    const { showCurrentWordAsLastSuggestion: showCurrentWordAsLastSuggestion, lang: lang } = config || {
        numOptions: 5,
        showCurrentWordAsLastSuggestion: true,
        lang: "hi"
    };
    // fetch suggestion from api
    // const url = `https://www.google.com/inputtools/request?ime=transliteration_en_${lang}&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&text=${word}`;
    // let myHeaders = new Headers();
    // myHeaders.append("Content-Type", "application/json");
    const requestOptions = {
        method: "GET"
    };
    try {
        const res = await fetch($905ee54827307cc1$export$ca6dda5263526f75 + `tl/${lang}/${word === "." || word === ".." ? " " + word.replace(".", "%2E") : encodeURIComponent(word).replace(".", "%2E")}`, requestOptions);
        const data = await res.json();
        // console.log("library data", data);
        if (data && data.result.length > 0) {
            const found = showCurrentWordAsLastSuggestion ? [
                ...data.result,
                word
            ] : data.result;
            return found;
        } else {
            if (showCurrentWordAsLastSuggestion) return [
                word
            ];
            return [];
        }
    } catch (e) {
        // catch error
        console.error("There was an error with transliteration", e);
        return [];
    }
};



const $bb5a013037ca2153$export$58f2e270169de9d3 = async () => {
    if (sessionStorage.getItem("indic_transliterate__supported_languages")) return JSON.parse(sessionStorage.getItem("indic_transliterate__supported_languages") || "");
    else {
        const apiURL = `${$905ee54827307cc1$export$ca6dda5263526f75}languages`;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const requestOptions = {
            method: "GET"
        };
        try {
            const res = await fetch(apiURL, requestOptions);
            const data = await res.json();
            sessionStorage.setItem("indic_transliterate__supported_languages", JSON.stringify(data));
            return data;
        } catch (e) {
            console.error("There was an error with transliteration", e);
            return [];
        }
    }
};


const $3f93eb6d5bf69cb7$var$KEY_UP = "ArrowUp";
const $3f93eb6d5bf69cb7$var$KEY_DOWN = "ArrowDown";
const $3f93eb6d5bf69cb7$var$KEY_ESCAPE = "Escape";
const $3f93eb6d5bf69cb7$var$OPTION_LIST_Y_OFFSET = 10;
const $3f93eb6d5bf69cb7$var$OPTION_LIST_MIN_WIDTH = 100;
const $3f93eb6d5bf69cb7$export$a62758b764e9e41d = ({ renderComponent: renderComponent = (props) =>/*#__PURE__*/ $dWhh5$reactjsxruntime.jsx("input", {
    ...props
})
    , lang: lang = "hi", offsetX: offsetX = 0, offsetY: offsetY = 10, onChange: onChange, onChangeText: onChangeText, onBlur: onBlur, value: value, onKeyDown: onKeyDown, containerClassName: containerClassName = "", containerStyles: containerStyles = {
    }, activeItemStyles: activeItemStyles = {
    }, maxOptions: maxOptions = 5, hideSuggestionBoxOnMobileDevices: hideSuggestionBoxOnMobileDevices = false, hideSuggestionBoxBreakpoint: hideSuggestionBoxBreakpoint = 450, triggerKeys: triggerKeys = [
        $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_SPACE,
        $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_ENTER,
        $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_RETURN,
        $9090cd5fdacb9284$export$24b0ea3375909d37.KEY_TAB,
    ], insertCurrentSelectionOnBlur: insertCurrentSelectionOnBlur = true, showCurrentWordAsLastSuggestion: showCurrentWordAsLastSuggestion = true, enabled: enabled = true, ...rest }) => {
    const [options, setOptions] = $dWhh5$react.useState([]);
    const [left, setLeft] = $dWhh5$react.useState(0);
    const [top, setTop] = $dWhh5$react.useState(0);
    const [selection, setSelection] = $dWhh5$react.useState(0);
    const [matchStart, setMatchStart] = $dWhh5$react.useState(-1);
    const [matchEnd, setMatchEnd] = $dWhh5$react.useState(-1);
    const inputRef = $dWhh5$react.useRef(null);
    const [windowSize, setWindowSize] = $dWhh5$react.useState({
        width: 0,
        height: 0
    });
    const [direction, setDirection] = $dWhh5$react.useState("ltr");
    const [googleFont, setGoogleFont] = $dWhh5$react.useState(null);
    const shouldRenderSuggestions = $dWhh5$react.useMemo(() => hideSuggestionBoxOnMobileDevices ? windowSize.width > hideSuggestionBoxBreakpoint : true
        , [
            windowSize,
            hideSuggestionBoxBreakpoint,
            hideSuggestionBoxOnMobileDevices
        ]);
    const reset = () => {
        // reset the component
        setSelection(0);
        setOptions([]);
    };
    const handleSelection = (index, triggerKey = " ") => {
        var ref;
        const currentString = value;
        // create a new string with the currently typed word
        // replaced with the word in transliterated language
        const newValue = currentString.substring(0, matchStart) + options[index] + " " + currentString.substring(matchEnd + 1, currentString.length);
        // set the position of the caret (cursor) one character after the
        // the position of the new word
        setTimeout(() => {
            $94c75e1d9a9e24f0$export$97ab23b40042f8af(
                inputRef.current, triggerKey === "Enter" ? matchStart + options[index].length : matchStart + options[index].length + 1);
        }, 1);
        // bubble up event to the parent component
        const e = {
            target: {
                value: newValue
            }
        };
        onChangeText(newValue);
        onChange && onChange(e);
        reset();
        return (ref = inputRef.current) === null || ref === void 0 ? void 0 : ref.focus();
    };
    const renderSuggestions = async (lastWord) => {
        if (!shouldRenderSuggestions) return;
        // fetch suggestion from api
        // const url = `https://www.google.com/inputtools/request?ime=transliteration_en_${lang}&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&text=${lastWord}`;
        const numOptions = showCurrentWordAsLastSuggestion ? maxOptions - 1 : maxOptions;
        const data = await $ad7f01abe8daa1b6$export$27f30d10c00bcc6c(lastWord, {
            numOptions: numOptions,
            showCurrentWordAsLastSuggestion: showCurrentWordAsLastSuggestion,
            lang: lang
        });
        setOptions(data !== null && data !== void 0 ? data : []);
    };
    const getDirectionAndFont = async (lang) => {
        const langList = await $bb5a013037ca2153$export$58f2e270169de9d3();
        const langObj = langList === null || langList === void 0 ? void 0 : langList.find((l) => l.LangCode === lang
        );
        var ref;
        return [
            (ref = langObj === null || langObj === void 0 ? void 0 : langObj.Direction) !== null && ref !== void 0 ? ref : "ltr",
            langObj === null || langObj === void 0 ? void 0 : langObj.GoogleFont,
            langObj === null || langObj === void 0 ? void 0 : langObj.FallbackFont,
        ];
    };
    const handleChange = (e) => {
        const value = e.currentTarget.value;
        // bubble up event to the parent component
        onChange && onChange(e);
        onChangeText(value);
        if (!shouldRenderSuggestions) return;
        // get the current index of the cursor
        const caret = $94c75e1d9a9e24f0$export$8a4ff65f970d59a5(e.target).end;
        const input = inputRef.current;
        if (!input) return;
        const caretPos = $parcel$interopDefault($dWhh5$textareacaret)(input, caret);
        // search for the last occurence of the space character from
        // the cursor
        const indexOfLastSpace = value.lastIndexOf(" ", caret - 1) < value.lastIndexOf("\n", caret - 1) ? value.lastIndexOf("\n", caret - 1) : value.lastIndexOf(" ", caret - 1);
        // first character of the currently being typed word is
        // one character after the space character
        // index of last character is one before the current position
        // of the caret
        setMatchStart(indexOfLastSpace + 1);
        setMatchEnd(caret - 1);
        // currentWord is the word that is being typed
        const currentWord = value.slice(indexOfLastSpace + 1, caret);
        if (currentWord && enabled) {
            // make an api call to fetch suggestions
            renderSuggestions(currentWord);
            const rect = input.getBoundingClientRect();
            // calculate new left and top of the suggestion list
            // minimum of the caret position in the text input and the
            // width of the text input
            const left = Math.min(caretPos.left, rect.width - $3f93eb6d5bf69cb7$var$OPTION_LIST_MIN_WIDTH / 2);
            // minimum of the caret position from the top of the input
            // and the height of the input
            const top = Math.min(caretPos.top + $3f93eb6d5bf69cb7$var$OPTION_LIST_Y_OFFSET, rect.height);
            setTop(top);
            setLeft(left);
        } else reset();
    };
    const handleKeyDown = (event) => {
        const helperVisible = options.length > 0;
        if (helperVisible) {
            if (triggerKeys.includes(event.key)) {
                event.preventDefault();
                handleSelection(selection, event.key);
            } else switch (event.key) {
                case $3f93eb6d5bf69cb7$var$KEY_ESCAPE:
                    event.preventDefault();
                    reset();
                    break;
                case $3f93eb6d5bf69cb7$var$KEY_UP:
                    event.preventDefault();
                    setSelection((options.length + selection - 1) % options.length);
                    break;
                case $3f93eb6d5bf69cb7$var$KEY_DOWN:
                    event.preventDefault();
                    setSelection((selection + 1) % options.length);
                    break;
                default:
                    onKeyDown && onKeyDown(event);
                    break;
            }
        } else onKeyDown && onKeyDown(event);
    };
    const handleBlur = (event) => {
        if (!$6a2317d46b969b19$export$e27e3030245d4c9b()) {
            if (insertCurrentSelectionOnBlur && options[selection]) handleSelection(selection);
            else reset();
        }
        onBlur && onBlur(event);
    };
    const handleResize = () => {
        // TODO implement the resize function to resize
        // the helper on screen size change
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize({
            width: width,
            height: height
        });
    };
    $dWhh5$react.useEffect(() => {
        window.addEventListener("resize", handleResize);
        const width = window.innerWidth;
        const height = window.innerHeight;
        setWindowSize({
            width: width,
            height: height
        });
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    $dWhh5$react.useEffect(() => {
        getDirectionAndFont(lang).then(([direction, googleFont, fallbackFont]) => {
            setDirection(direction);
            // import google font if not already imported
            if (googleFont) {
                if (!document.getElementById(`font-${googleFont}`)) {
                    const link = document.createElement("link");
                    link.id = `font-${googleFont}`;
                    link.href = `https://fonts.googleapis.com/css?family=${googleFont}`;
                    link.rel = "stylesheet";
                    document.head.appendChild(link);
                }
                setGoogleFont(`${googleFont}, ${fallbackFont !== null && fallbackFont !== void 0 ? fallbackFont : "sans-serif"}`);
            } else setGoogleFont(null);
        });
    }, [
        lang
    ]);
    return (/*#__PURE__*/ $dWhh5$reactjsxruntime.jsxs("div", {
        // position relative is required to show the component
        // in the correct position
        style: {
            ...containerStyles,
            position: "relative"
        },
        className: containerClassName,
        children: [
            renderComponent({
                onChange: handleChange,
                onKeyDown: handleKeyDown,
                onBlur: handleBlur,
                ref: inputRef,
                value: value,
                "data-testid": "rt-input-component",
                lang: lang,
                style: {
                    direction: direction,
                    ...googleFont && {
                        fontFamily: googleFont
                    }
                },
                ...rest
            }),
            shouldRenderSuggestions && options.length > 0 && /*#__PURE__*/ $dWhh5$reactjsxruntime.jsx("ul", {
                style: {
                    left: `${left + offsetX}px`,
                    top: `${top + offsetY}px`,
                    position: "absolute",
                    width: "auto",
                    ...googleFont && {
                        fontFamily: googleFont
                    }
                },
                className: (/*@__PURE__*/$parcel$interopDefault($479169a4406ef977$exports)).ReactTransliterate,
                "data-testid": "rt-suggestions-list",
                lang: lang,
                children: Array.from(new Set(options)).map((item, index) =>/*#__PURE__*/ $dWhh5$reactjsxruntime.jsx("li", {
                    className: index === selection ? (/*@__PURE__*/$parcel$interopDefault($479169a4406ef977$exports)).Active : undefined,
                    style: index === selection ? activeItemStyles || {
                    } : {
                    },
                    onMouseEnter: () => {
                        setSelection(index);
                    },
                    onClick: () => handleSelection(index)
                    ,
                    children: item
                }, item)
                )
            })
        ]
    }));
};


//# sourceMappingURL=index.js.map
