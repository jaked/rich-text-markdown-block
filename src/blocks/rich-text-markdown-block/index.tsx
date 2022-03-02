import { useState } from "react";
import {
  Plate,

  createPlugins,
  createPlateUI,

  createBoldPlugin,
  createItalicPlugin,
  createCodePlugin,

  createParagraphPlugin,
  createBlockquotePlugin,
  createCodeBlockPlugin,
  createHeadingPlugin,

  createListPlugin,
  createHorizontalRulePlugin,

  createAutoformatPlugin,
} from '@udecode/plate'
import {
  MARK_BOLD,
  MARK_CODE,
  MARK_ITALIC,
} from '@udecode/plate-basic-marks';
import { ELEMENT_BLOCKQUOTE } from '@udecode/plate-block-quote';
import { ELEMENT_CODE_BLOCK } from '@udecode/plate-code-block';
import {
  ELEMENT_H1,
  ELEMENT_H2,
  ELEMENT_H3,
  ELEMENT_H4,
  ELEMENT_H5,
  ELEMENT_H6,
} from '@udecode/plate-heading';
import { ELEMENT_LINK } from '@udecode/plate-link';
import { ELEMENT_LI, ELEMENT_OL, ELEMENT_UL } from '@udecode/plate-list';
import { ELEMENT_PARAGRAPH } from '@udecode/plate-paragraph';

import markdown from 'remark-parse';
import slate from 'remark-slate';
import { serialize } from 'remark-slate';
import unified from 'unified';

import { FileBlockProps } from "@githubnext/utils";

// cribbed from
// https://github.com/udecode/plate/blob/main/packages/serializers/md/src/deserializer/utils/deserializeMd.ts
export const deserializeMd = (data: string) => {
  const tree: any = unified()
    .use(markdown)
    .use(slate, {
      nodeTypes: {
        paragraph: ELEMENT_PARAGRAPH,
        block_quote: ELEMENT_BLOCKQUOTE,
        link: ELEMENT_LINK,
        inline_code_mark: MARK_CODE,
        emphasis_mark: MARK_ITALIC,
        strong_mark: MARK_BOLD,
        code_block: ELEMENT_CODE_BLOCK,
        ul_list: ELEMENT_UL,
        ol_list: ELEMENT_OL,
        listItem: ELEMENT_LI,
        heading: {
          1: ELEMENT_H1,
          2: ELEMENT_H2,
          3: ELEMENT_H3,
          4: ELEMENT_H4,
          5: ELEMENT_H5,
          6: ELEMENT_H6,
        },
      },
      linkDestinationKey: 'url',
      // TODO(jaked) doesn't deserialize links
      // TODO(jaked) deserializes images but they aren't displayed?
    })
    .processSync(data);

  return tree.result;
};

export const serializeMd = (data: any): string => {
  // TODO(jaked) doesn't handle headers
  // TODO(jaked) doesn't handle block quotes
  // TODO(jaked) apostrophes roundtrip to HTML entities
  const markdown = data.map(serialize).join('\n\n');
  console.log()
  return markdown;
}

export default function (props: FileBlockProps) {
  const { content, onRequestUpdateContent } = props;

  const plugins = createPlugins([
    createBoldPlugin(),
    createItalicPlugin(),
    createCodePlugin(),

    createParagraphPlugin(),
    createBlockquotePlugin(),
    createCodeBlockPlugin(),
    createHeadingPlugin(),

    createListPlugin(),
    createHorizontalRulePlugin(),

    // TODO(jaked) doesn't work, why not?
    createAutoformatPlugin(),
  ], {
    components: createPlateUI()
  });

  const [modifiedData, setModifiedData] = useState<any[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  return (
    <div className="height-full d-flex flex-column">
      <div className="flex-1" style={{ zIndex: 1 }}>
        <Plate
          plugins={plugins}
          initialValue={deserializeMd(content)}
          editableProps={{ style: { padding: '15px' } }}
          onChange={(data: any) => {
            // TODO(jaked) fires on cursor move even when there's no text change
            setModifiedData(data);
            setIsDirty(true)
          }}
        />
      </div>
      {isDirty && (
        <button
          className="position-absolute btn btn-primary inline-block"
          style={{
            bottom: "12px",
            right: "175px",
            zIndex: 10,
          }}
          onClick={() => {
            onRequestUpdateContent(serializeMd(modifiedData));
          }}>
          Save changes
        </button>
      )}
    </div >
  );
}
