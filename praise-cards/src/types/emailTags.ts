export enum EmailTag {
  CRITICAL_BUG = "🔴 Bug: Critical/Data loss",
  FUNCTIONAL_BUG = "🟠 Bug: Functional",
  VISUAL_BUG = "🟡 Bug: Visual/UI",
  UX_PUSHBACK = "🎨 Design/UX Pushback",
  CONTENT_ISSUE = "🎭 Content Issue",
  FEATURE_REQUEST = "💡 Feature Request",
  HOW_TO = "❓ How-to/Confusion",
  PRAISE = "❤️ Praise",
  REFUND_CHURN = "💸 Refund/Churn",
  HIRING_COLLAB = "🤝 Hiring/Collab",
  BLANK = "⚪️ Blank Message",
}

export interface AIResponse {
  tag: EmailTag;
  confidence_score: number;
  cleaned_message: string;
  extracted_name?: string;
}
