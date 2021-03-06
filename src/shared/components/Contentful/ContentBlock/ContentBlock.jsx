/**
 * The core content block rendering.
 */

import PT from 'prop-types';
import React from 'react';

import MarkdownRenderer from 'components/MarkdownRenderer';
import { themr } from 'react-css-super-themr';
import { fixStyle } from 'utils/contentful';

import defaultTheme from './themes/default.scss';

function ContentBlock({
  id,
  background,
  contentBlock,
  theme,
  spaceName,
  environment,
  preview,
}) {
  const contentfulConfig = {
    spaceName,
    environment,
    preview,
  };
  return (
    <div
      id={id}
      className={theme.container}
      style={fixStyle(contentBlock.extraStylesForContainer)}
    >
      <div
        className={theme.contentWrapper}
        style={fixStyle(contentBlock.extraStylesForContentWrapper)}
      >
        {
          background ? (
            <div className={theme.image}>
              <img alt={contentBlock.alt || contentBlock.name} src={background.file.url} />
            </div>
          ) : null
        }
        <div
          className={theme.content}
          style={fixStyle(contentBlock.extraStylesForContent)}
        >
          <MarkdownRenderer markdown={contentBlock.text} {...contentfulConfig} />
        </div>
      </div>
    </div>
  );
}

ContentBlock.defaultProps = {
  background: null,
  preview: false,
  spaceName: null,
  environment: null,
};

ContentBlock.propTypes = {
  id: PT.string.isRequired,
  background: PT.shape(),
  contentBlock: PT.shape().isRequired,
  theme: PT.shape({
    container: PT.string.isRequired,
    content: PT.string.isRequired,
    contentWrapper: PT.string.isRequired,
    contentByImage: PT.string,
    contentWrapperByImage: PT.string,
    image: PT.string,
  }).isRequired,
  preview: PT.bool,
  spaceName: PT.string,
  environment: PT.string,
};

export default themr('ContentBlock', defaultTheme)(ContentBlock);
