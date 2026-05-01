"use client";

import { useEffect } from "react";
import {
  BlockNoteSchema,
  defaultBlockSpecs,
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

const schema = BlockNoteSchema.create({
  blockSpecs: {
    paragraph: defaultBlockSpecs.paragraph,
    bulletListItem: defaultBlockSpecs.bulletListItem,
    numberedListItem: defaultBlockSpecs.numberedListItem,
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
