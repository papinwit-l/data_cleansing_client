import { useState, useRef, useEffect } from "react";
import { Label } from "../../ui/label";
import { Input } from "../../ui/input";

const TextEditorModal = ({
  isOpen,
  onClose,
  onSave,
  initialText = "",
  title = "Edit Text",
  placeholder = "Enter your text...",
  revertText,
  maxTableRows,
  setMaxTableRows,
}) => {
  const [tempText, setTempText] = useState("");
  const textareaRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setTempText(initialText);
    }
  }, [isOpen, initialText]);

  const handleSave = () => {
    onSave(tempText);
    onClose();
  };

  const handleCancel = () => {
    setTempText(initialText);
    onClose();
  };

  const resetToDefault = () => {
    // setTempText(initialText);
    revertText();
    onClose();
  };

  const insertFormatting = (startTag, endTag) => {
    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = tempText.substring(start, end);
    const newText =
      tempText.substring(0, start) +
      startTag +
      selectedText +
      endTag +
      tempText.substring(end);
    setTempText(newText);
    // Restore cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startTag.length,
        end + startTag.length
      );
    }, 0);
  };

  const handleSetMaxTableRows = (e, index) => {
    const value = Math.max(0, Number.parseInt(e.target.value));
    setMaxTableRows((prev) => {
      const newState = [...prev];
      newState[index] = value;
      return newState;
    });
  };

  const renderFormattedText = (text) => {
    // Simple HTML parsing for basic formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<span class="font-semibold">$1</span>')
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/~~(.*?)~~/g, '<span class="text-red-500">$1</span>')
      .replace(/\+\+(.*?)\+\+/g, '<span class="text-green-500">$1</span>')
      .replace(
        /\[\[(.*?)\]\]/g,
        '<span class="text-blue-500 font-semibold">$1</span>'
      )
      .replace(/\{\{(.*?)\}\}/g, '<span class="text-lg font-bold">$1</span>')
      .replace(
        /$$\((.*?)$$\)/g,
        '<span class="text-sm text-gray-600">$1</span>'
      );
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">{title}</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {/* Table Controls */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4">
            <div className="flex flex-col gap-4">
              {maxTableRows.length > 0 &&
                maxTableRows.map((value, index) => (
                  <div key={`table-${index}`} className="flex-1 flex gap-4">
                    <div className="flex-1">
                      <Label
                        htmlFor={`maxTableRows-${index}`}
                        className="text-sm font-medium text-gray-700 mb-1 block"
                      >
                        Max Table Rows{" "}
                        {maxTableRows.length > 1 ? `(Table ${index + 1})` : ""}
                      </Label>
                      <div className="relative">
                        <Input
                          id={`maxTableRows-${index}`}
                          type="number"
                          value={value || 0}
                          onChange={(e) => handleSetMaxTableRows(e, index)}
                          className="w-full text-left font-mono"
                          min="0"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                        <span className="font-medium">
                          {(value || 0) === 0
                            ? "No limit"
                            : `Limited to ${value || 0} rows`}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Set to 0 for unlimited table rows
                      </p>
                    </div>
                  </div>
                ))}
            </div>
          </div>

          {/* Formatting Toolbar */}
          <div className="flex flex-wrap gap-2 p-3 bg-gray-50 rounded-lg border">
            <button
              onClick={() => insertFormatting("**", "**")}
              className="px-3 py-1 bg-white border rounded text-sm font-bold hover:bg-gray-100 transition-colors"
              title="Bold"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => insertFormatting("*", "*")}
              className="px-3 py-1 bg-white border rounded text-sm italic hover:bg-gray-100 transition-colors"
              title="Italic"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => insertFormatting("__", "__")}
              className="px-3 py-1 bg-white border rounded text-sm underline hover:bg-gray-100 transition-colors"
              title="Underline"
            >
              U
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
              onClick={() => insertFormatting("~~", "~~")}
              className="px-3 py-1 bg-white border rounded text-sm text-red-500 hover:bg-gray-100 transition-colors"
              title="Red text"
            >
              Red
            </button>
            <button
              onClick={() => insertFormatting("++", "++")}
              className="px-3 py-1 bg-white border rounded text-sm text-green-500 hover:bg-gray-100 transition-colors"
              title="Green text"
            >
              Green
            </button>
            <button
              onClick={() => insertFormatting("[[", "]]")}
              className="px-3 py-1 bg-white border rounded text-sm text-blue-500 font-semibold hover:bg-gray-100 transition-colors"
              title="Blue highlight"
            >
              Blue
            </button>
            <div className="w-px bg-gray-300 mx-1"></div>
            <button
              onClick={() => insertFormatting("{{", "}}")}
              className="px-3 py-1 bg-white border rounded text-lg font-bold hover:bg-gray-100 transition-colors"
              title="Large text"
            >
              Large
            </button>
            <button
              onClick={() => insertFormatting("((", "))")}
              className="px-3 py-1 bg-white border rounded text-sm text-gray-600 hover:bg-gray-100 transition-colors"
              title="Small text"
            >
              Small
            </button>
          </div>

          {/* Text Editor */}
          <div className="space-y-3">
            <textarea
              ref={textareaRef}
              value={tempText}
              onChange={(e) => setTempText(e.target.value)}
              className="w-full border rounded-lg px-4 py-3 min-h-[150px] font-mono text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y"
              placeholder={placeholder}
            />
            {/* Preview */}
            <div className="border rounded-lg p-4 bg-gray-50">
              <div className="text-sm font-medium text-gray-700 mb-2">
                Preview:
              </div>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{
                  __html: renderFormattedText(tempText),
                }}
              />
            </div>
          </div>

          {/* Formatting Guide */}
          <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
            <strong className="text-gray-800">Formatting Guide:</strong>
            <br />
            <div className="mt-1 space-y-1">
              <div>
                **bold** = <strong>bold</strong>, *italic* = <em>italic</em>,
                __underline__ = <u>underline</u>
              </div>
              <div>
                ~~red~~ = <span className="text-red-500">red text</span>,
                ++green++ = <span className="text-green-500">green text</span>,
                [[blue]] ={" "}
                <span className="text-blue-500 font-semibold">
                  blue highlight
                </span>
              </div>
              <div>
                {"{{large}}"} ={" "}
                <span className="text-lg font-bold">large text</span>, ((small))
                = <span className="text-sm text-gray-600">small text</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-gray-50 rounded-b-xl">
          <button
            onClick={resetToDefault}
            className="px-4 py-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
          >
            Reset to Original
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="px-6 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TextEditorModal;
