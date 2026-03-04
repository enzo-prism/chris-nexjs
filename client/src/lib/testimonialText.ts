const NO_ADDITIONAL_COMMENT_PATTERN =
  /^Left a \d(?:-|\s)?star Google review with no additional comment\.?$/i;

export function isNoAdditionalCommentPlaceholder(text: string): boolean {
  return NO_ADDITIONAL_COMMENT_PATTERN.test(text.trim());
}
