// Default code for each language
const defaultCode = {
    python: `print("Hello from Python!")`,
    javascript: `console.log("Hello from JavaScript!");`,
    cpp: `#include <iostream>
using namespace std;
int main() {
    cout << "Hello from C++!" << endl;
    return 0;
}`,
    java: `public class Main {
    public static void main(String[] args) {
        System.out.println("Hello from Java!");
    }
}`
,
    C: `#include <stdio.h>

int main() {
    printf("Hello from C!\\n");
    return 0;
}`

}
;

// Load Monaco Editor
require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" } });

let editor;

require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById("editor"), {
        value: defaultCode.python,
        language: "python",
        theme: "vs-dark"
    });
    // Enable IntelliSense for JavaScript & TypeScript
monaco.languages.typescript.javascriptDefaults.setEagerModelSync(true);
monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: false,
    noSyntaxValidation: false
});
// Basic keyword completions for non-JS languages
const customLanguages = {
    python: ['print', 'def', 'import', 'for', 'while', 'if', 'elif', 'else'],
    c: ['#include', 'int', 'return', 'printf', 'scanf', 'void', 'main'],
    cpp: ['#include', 'int', 'return', 'cout', 'cin', 'void', 'main', 'std'],
    java: ['public', 'class', 'static', 'void', 'main', 'System', 'String']
};

Object.keys(customLanguages).forEach(lang => {
    monaco.languages.registerCompletionItemProvider(lang, {
        provideCompletionItems: () => {
            return {
                suggestions: customLanguages[lang].map(keyword => ({
                    label: keyword,
                    kind: monaco.languages.CompletionItemKind.Keyword,
                    insertText: keyword
                }))
            };
        }
    });
});

});

// Change language and default code when dropdown changes
document.getElementById("languageSelect").addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const languageMode = selectedOption.getAttribute("data-mode");
    editor.setValue(defaultCode[languageMode] || "");
    monaco.editor.setModelLanguage(editor.getModel(), languageMode);
});

document.getElementById("runBtn").addEventListener("click", runCode);

async function runCode() {
    const code = editor.getValue();
    const outputEl = document.getElementById("output");
    const languageId = document.getElementById("languageSelect").value;

    outputEl.textContent = "Running code...";

    try {
        // Create submission
        const submissionRes = await fetch("https://judge0-ce.p.rapidapi.com/submissions?base64_encoded=false&wait=false", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-RapidAPI-Key": "54159da8f4msh4f69695bc2b31e6p1415fejsn51914629da50", // <-- Replace with your API key
                "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
            },
            body: JSON.stringify({
                source_code: code,
                language_id: Number(languageId)
            })
        });

        const { token } = await submissionRes.json();

        // Wait for result
        let result;
        while (true) {
            const res = await fetch(`https://judge0-ce.p.rapidapi.com/submissions/${token}?base64_encoded=false`, {
                method: "GET",
                headers: {
                    "X-RapidAPI-Key": " 54159da8f4msh4f69695bc2b31e6p1415fejsn51914629da50", // <-- Same key here
                    "X-RapidAPI-Host": "judge0-ce.p.rapidapi.com"
                }
            });
            result = await res.json();
            if (result.status && result.status.id > 2) break;
            await new Promise(r => setTimeout(r, 1000));
        }

        // Show output with status info
        outputEl.textContent = 
            `Status: ${result.status.description}\n` +
            (result.stdout ? `Output:\n${result.stdout}` : "") +
            (result.stderr ? `\nErrors:\n${result.stderr}` : "") +
            (result.compile_output ? `\nCompiler Output:\n${result.compile_output}` : "") +
            (result.time ? `\nExecution Time: ${result.time}s` : "") +
            (result.memory ? `\nMemory Used: ${result.memory} KB` : "");
    } catch (err) {
        outputEl.textContent = "Error: " + err.message;
    }
}
