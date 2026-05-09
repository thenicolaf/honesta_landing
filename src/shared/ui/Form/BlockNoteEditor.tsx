"use client";

import { useEffect } from "react";
import {
  BlockNoteSchema,
  COLORS_DEFAULT,
  createStyleSpec,
  defaultBlockSpecs,
  defaultStyleSpecs,
  filterSuggestionItems,
} from "@blocknote/core";
import {
  useCreateBlockNote,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
} from "@blocknote/react";
import { BlockNoteView } from "@blocknote/mantine";
import "@blocknote/core/fonts/inter.css";
import "@blocknote/mantine/style.css";

// ─── Color round-trip helpers ────────────────────────────────────────────
//
// BlockNote's default `parse` for textColor/backgroundColor returns the literal
// CSS value (`rgb(11, 110, 153)`), so after a lossy round-trip the picker can
// no longer recognise the named colour and shows no checkmark. We override
// `parse` to map `rgb()`/`#hex` back to BlockNote's named colours when possible.

function cssColorToHex(value: string): string | null {
  const trimmed = value.trim().toLowerCase();
  if (/^#[0-9a-f]{6}$/.test(trimmed)) return trimmed;
  if (/^#[0-9a-f]{3}$/.test(trimmed)) {
    return (
      "#" +
      trimmed[1].repeat(2) +
      trimmed[2].repeat(2) +
      trimmed[3].repeat(2)
    );
  }
  const m = trimmed.match(/^rgb\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/);
  if (m) {
    return (
      "#" +
      [m[1], m[2], m[3]]
        .map((n) => parseInt(n, 10).toString(16).padStart(2, "0"))
        .join("")
    );
  }
  return null;
}

function buildHexToName(kind: "text" | "background"): Record<string, string> {
  const map: Record<string, string> = {};
  for (const [name, colors] of Object.entries(COLORS_DEFAULT)) {
    if (name === "default") continue;
    const hex = cssColorToHex(kind === "text" ? colors.text : colors.background);
    if (hex) map[hex] = name;
  }
  return map;
}

const TEXT_HEX_TO_NAME = buildHexToName("text");
const BG_HEX_TO_NAME = buildHexToName("background");

function resolveColorName(
  value: string,
  map: Record<string, string>,
): string | undefined {
  const hex = cssColorToHex(value);
  return hex ? map[hex] : undefined;
}

const customTextColor = createStyleSpec(
  { type: "textColor", propSchema: "string" } as const,
  {
    render: () => {
      const span = document.createElement("span");
      return { dom: span, contentDOM: span };
    },
    toExternalHTML: (value) => {
      const span = document.createElement("span");
      if (value !== "default") {
        const entry = COLORS_DEFAULT[value];
        span.style.color = entry ? entry.text : value;
      }
      return { dom: span, contentDOM: span };
    },
    parse: (element) => {
      if (element.tagName !== "SPAN" || !element.style.color) return undefined;
      const name = resolveColorName(element.style.color, TEXT_HEX_TO_NAME);
      return name ?? element.style.color;
    },
  },
);

const customBackgroundColor = createStyleSpec(
  { type: "backgroundColor", propSchema: "string" } as const,
  {
    render: () => {
      const span = document.createElement("span");
      return { dom: span, contentDOM: span };
    },
    toExternalHTML: (value) => {
      const span = document.createElement("span");
      if (value !== "default") {
        const entry = COLORS_DEFAULT[value];
        span.style.backgroundColor = entry ? entry.background : value;
      }
      return { dom: span, contentDOM: span };
    },
    parse: (element) => {
      if (element.tagName !== "SPAN" || !element.style.backgroundColor)
        return undefined;
      const name = resolveColorName(
        element.style.backgroundColor,
        BG_HEX_TO_NAME,
      );
      return name ?? element.style.backgroundColor;
    },
  },
);

const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
  },
  styleSpecs: {
    ...defaultStyleSpecs,
    textColor: customTextColor,
    backgroundColor: customBackgroundColor,
  },
});

const ALLOWED_SLASH_TITLES = new Set([
  "Paragraph",
  "Bullet List",
  "Numbered List",
]);

interface BlockNoteEditorProps {
  initialHtml: string;
  placeholder?: string;
  onHtmlChange: (html: string) => void;
}

export default function BlockNoteEditor({
  initialHtml,
  placeholder,
  onHtmlChange,
}: BlockNoteEditorProps) {
  const editor = useCreateBlockNote({
    schema,
    placeholders: placeholder ? { emptyDocument: placeholder } : undefined,
  });

  useEffect(() => {
    if (!initialHtml) return;
    const blocks = editor.tryParseHTMLToBlocks(initialHtml);
    if (blocks.length > 0) {
      editor.replaceBlocks(editor.document, blocks);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor]);

  return (
    <BlockNoteView
      editor={editor}
      theme="light"
      slashMenu={false}
      onChange={() => {
        onHtmlChange(editor.blocksToHTMLLossy(editor.document));
      }}
    >
      <SuggestionMenuController
        triggerCharacter="/"
        getItems={async (query) =>
          filterSuggestionItems(
            getDefaultReactSlashMenuItems(editor).filter((item) =>
              ALLOWED_SLASH_TITLES.has(item.title),
            ),
            query,
          )
        }
      />
    </BlockNoteView>
  );
}
