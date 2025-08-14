
const defaultCod = {
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
};

require.config({ paths: { vs: "https://cdnjs.cloudflare.com/ajax/libs/monaco-editor/0.45.0/min/vs" } });

let editor;

require(["vs/editor/editor.main"], function () {
    editor = monaco.editor.create(document.getElementById("editor"), {
        value: defaultCod[defaultLanguage],
        language: "python",
        theme: "vs-dark"
    });
    
    const customLanguages = {
        python: ['print', 'def', 'import', 'for', 'while', 'if', 'elif', 'else'],
        c: ['#include', 'int', 'return', 'printf', 'scanf', 'void', 'main'],
        cpp: ['#include', 'int', 'return', 'cout', 'cin', 'void', 'main', 'std'],
        java: ['public', 'class', 'static', 'void', 'main', 'System', 'String','int','double', 'if', 'else', 'for', 'while','char']
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

document.getElementById("languageSelect").addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const languageMode = selectedOption.getAttribute("data-mode");
    editor.setValue(defaultCode[languageMode] || "");
    monaco.editor.setModelLanguage(editor.getModel(), languageMode);
});


document.getElementById("runBtn").addEventListener("click", function () {
    const code = editor.getValue();
    fetch("/run", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: code , programID: document.getElementById("languageSelect").value })
    })
    .then(response => response.json())
    .then(data => {
        console.log("Output:", data.output);
        document.getElementById("output").textContent = data.output || "No output";
    })
    .catch(error => {
        console.error("Error:", error);
    });
});
