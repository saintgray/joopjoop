export function toKoreanMessage(code: string, fallback?: string) {
  const c = code.trim();

  const map: Record<string, string> = {
    // auth/register
    INVALID_INPUT: "입력값을 확인해주세요.",
    EMAIL_REQUIRED: "이메일을 입력해주세요.",
    EMAIL_EXISTS: "이미 가입된 이메일이에요.",
    RATE_LIMITED: "요청이 너무 많아요. 잠시 후 다시 시도해주세요.",
    EMAIL_SEND_FAILED: "이메일 인증코드 전송에 실패했어요. 잠시 후 다시 시도해주세요.",
    INFO_REQUIRED: "필수 정보를 입력해주세요.",
    INVALID_CODE: "인증코드가 올바르지 않아요.",
    CODE_EXPIRED: "인증코드가 만료됐어요. 다시 받아주세요.",
    EMAIL_VERIFY_FIRST: "먼저 이메일 인증을 완료해주세요.",
    SMS_SEND_FAILED: "문자 인증코드 전송에 실패했어요. 잠시 후 다시 시도해주세요.",
    EMAIL_VERIFICATION_REQUIRED: "이메일 인증이 필요해요.",
    PHONE_VERIFICATION_REQUIRED: "전화번호 인증이 필요해요.",

    // items
    UNAUTHORIZED: "로그인이 필요해요.",
    INVALID_META: "요청 정보를 읽지 못했어요. 다시 시도해주세요.",
    INVALID_IMAGE: "사진 파일을 확인해주세요.",
    UNSUPPORTED_IMAGE_FORMAT: "HEIC/HEIF 사진은 아직 지원하지 않아요. JPG/PNG로 변환 후 업로드해주세요.",
    IMAGE_PROCESSING_FAILED: "사진을 처리하지 못했어요. 다른 사진으로 다시 시도해주세요.",
    DUPLICATE_IMAGE_RECENT: "최근에 비슷한 사진으로 올린 글이 있어요. 중복 등록인지 확인해주세요.",
    ATLAS_TOKEN_FAILED: "사진 업로드 준비에 실패했어요. 잠시 후 다시 시도해주세요.",
    ATLAS_UPLOAD_FAILED: "사진 업로드에 실패했어요. 네트워크 상태를 확인하고 다시 시도해주세요.",

    // threads
    LOAD_FAILED: "대화를 불러오지 못했어요. 잠시 후 다시 시도해주세요.",
    SEND_FAILED: "메시지 전송에 실패했어요. 잠시 후 다시 시도해주세요.",
    THREAD_CREATE_FAILED: "채팅을 시작할 수 없어요. 잠시 후 다시 시도해주세요.",

    // reports
    REPORT_FAILED: "신고 접수에 실패했어요. 잠시 후 다시 시도해주세요.",

    // deprecated routes
    DEPRECATED_USE_NEXTAUTH: "로그인 방식이 변경되었어요. 화면에서 다시 로그인해주세요.",
    DEPRECATED_USE_REGISTER: "회원가입 방식이 변경되었어요. 회원가입 화면에서 진행해주세요.",
  };

  if (map[c]) return map[c];
  if (c.startsWith("HTTP_")) return "요청 처리 중 문제가 발생했어요. 잠시 후 다시 시도해주세요.";
  return fallback ?? "잠시 후 다시 시도해주세요.";
}

