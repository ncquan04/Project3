import React, { useMemo } from 'react';
import {
  ActivityIndicator,
  FlatList,
  ScrollView,
  StyleSheet,
  View,
  ViewStyle,
} from 'react-native';
import { THEME_COLOR } from '../../../theme';
import AppText from '../../../components/appText/AppText';
import CommonButton from '../../../components/common/CommonButton';
import { Class } from '../../../types';
import {
  StudentCheckinState,
  StudentCheckinStep,
  TeacherSessionState,
} from '../types';
import CheckIconCircle from '../../../icons/CheckIconCircle';

type CheckinModalProps = {
  mode: 'student' | 'teacher' | null;
  studentState: StudentCheckinState;
  teacherState: TeacherSessionState;
  activeClass: Class | null;
  onDismiss: () => void;
};

type StepIndicatorProps = {
  label: string;
  status: 'pending' | 'active' | 'done';
};

const STUDENT_STEPS: { key: StudentCheckinStep; label: string }[] = [
  { key: 'discovering', label: 'Tìm dịch vụ' },
  { key: 'connecting', label: 'Kết nối phiên' },
  { key: 'sending', label: 'Gửi xác nhận' },
];

const STEP_ORDER = STUDENT_STEPS.map(step => step.key);

const getInitial = (value?: string | null) => {
  if (!value) {
    return 'SV';
  }
  const trimmed = value.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : 'SV';
};

const CheckinModal = ({
  mode,
  studentState,
  teacherState,
  activeClass,
  onDismiss,
}: CheckinModalProps) => {
  const header = useMemo(() => {
    if (mode === 'teacher') {
      return 'Phiên điểm danh (Giảng viên)';
    }
    if (mode === 'student') {
      return 'Điểm danh sinh viên';
    }
    return 'Điểm danh';
  }, [mode]);

  const renderContent = () => {
    if (mode === 'teacher') {
      return <TeacherPanel state={teacherState} />;
    }

    if (mode === 'student') {
      return <StudentPanel state={studentState} />;
    }

    return (
      <View style={styles.placeholderBlock}>
        <AppText style={styles.placeholderTitle}>
          Chưa thể bắt đầu điểm danh
        </AppText>
        <AppText style={styles.placeholderDescription}>
          Hãy trượt để điểm danh từ màn hình chính.
        </AppText>
      </View>
    );
  };

  const badgeLabel = mode === 'teacher' ? 'Giảng viên' : 'Sinh viên';
  const badgeStyle =
    mode === 'teacher' ? styles.modeBadgeTeacher : styles.modeBadgeStudent;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollArea}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerRow}>
          <AppText style={styles.header}>{header}</AppText>
          {mode && (
            <View style={[styles.modeBadge, badgeStyle]}>
              <AppText style={styles.modeBadgeText}>{badgeLabel}</AppText>
            </View>
          )}
        </View>
        <ClassSummary cls={activeClass} />
        {renderContent()}
      </ScrollView>
      <CommonButton buttonText="Đóng" onPress={onDismiss} />
    </View>
  );
};

const ClassSummary = ({ cls }: { cls: Class | null }) => {
  if (!cls) {
    return (
      <View style={[styles.classCard, styles.classCardEmpty]}>
        <AppText style={styles.placeholderTitle}>
          Không tìm thấy lớp học
        </AppText>
        <AppText style={styles.placeholderDescription}>
          Vui lòng kiểm tra lại thời khóa biểu hoặc thử lại sau.
        </AppText>
      </View>
    );
  }

  return (
    <View style={styles.classCard}>
      <View style={styles.classCardTop}>
        <AppText style={styles.classCardLabel}>Lớp học hiện tại</AppText>
        <View style={styles.classCodeChip}>
          <AppText style={styles.classCodeText}>{cls.subjectCode}</AppText>
        </View>
      </View>
      <AppText style={styles.classTitle}>{cls.subjectName}</AppText>
      <View style={styles.classMetaRow}>
        <View style={styles.classMetaItem}>
          <AppText style={styles.classMetaLabel}>Giảng viên</AppText>
          <AppText style={styles.classMetaValue}>
            {cls.teacher?.name ?? 'Đang cập nhật'}
          </AppText>
        </View>
        <View style={styles.classMetaItem}>
          <AppText style={styles.classMetaLabel}>Thời gian</AppText>
          <AppText style={styles.classMetaValue}>
            {cls.schedule?.startTime} - {cls.schedule?.endTime}
          </AppText>
        </View>
      </View>
    </View>
  );
};

const StudentPanel = ({ state }: { state: StudentCheckinState }) => {
  const currentIndex = state.currentStep
    ? STEP_ORDER.indexOf(state.currentStep)
    : -1;

  const getStatus = (
    stepKey: StudentCheckinStep,
  ): StepIndicatorProps['status'] => {
    if (state.phase === 'success') {
      return 'done';
    }

    if (state.phase === 'error') {
      return currentIndex > STEP_ORDER.indexOf(stepKey) ? 'done' : 'pending';
    }

    if (state.currentStep === stepKey) {
      return 'active';
    }

    if (currentIndex > STEP_ORDER.indexOf(stepKey)) {
      return 'done';
    }

    return 'pending';
  };

  const isLoading = ['discovering', 'connecting', 'sending'].includes(
    state.phase,
  );

  const showSuccess = state.phase === 'success';

  const statusMeta = (() => {
    switch (state.phase) {
      case 'discovering':
        return { label: 'Đang tìm phiên', color: THEME_COLOR.primary };
      case 'connecting':
        return { label: 'Đang kết nối', color: THEME_COLOR.primary };
      case 'sending':
        return { label: 'Đang gửi', color: THEME_COLOR.primary };
      case 'success':
        return { label: 'Hoàn tất', color: THEME_COLOR.freshGreen };
      case 'error':
        return { label: 'Gặp lỗi', color: THEME_COLOR.coralRed };
      default:
        return { label: 'Sẵn sàng', color: THEME_COLOR.grey };
    }
  })();

  return (
    <View style={styles.panelCard}>
      <View style={styles.panelHeader}>
        <View>
          <AppText style={styles.panelTitle}>Tiến trình điểm danh</AppText>
          <AppText style={styles.panelSubtitle}>
            Theo dõi từng bước xử lý yêu cầu của bạn.
          </AppText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: `${statusMeta.color}15` },
          ]}
        >
          <AppText style={[styles.statusPillText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </AppText>
        </View>
      </View>
      <View style={styles.stepList}>
        {STUDENT_STEPS.map(step => (
          <StepIndicator
            key={step.key}
            label={step.label}
            status={getStatus(step.key)}
          />
        ))}
      </View>
      {isLoading && (
        <View style={styles.feedbackCard}>
          <ActivityIndicator color={THEME_COLOR.primary} />
          <AppText style={styles.feedbackText}>
            {state.message ?? 'Đang xử lý yêu cầu...'}
          </AppText>
        </View>
      )}
      {showSuccess && (
        <View style={styles.successBlock}>
          <CheckIconCircle
            width={56}
            height={56}
            fill={THEME_COLOR.freshGreen}
          />
          <AppText style={styles.successTitle}>Điểm danh thành công!</AppText>
          {state.receiptId && (
            <View style={styles.successReceipt}>
              <AppText style={styles.successReceiptLabel}>Mã xác nhận</AppText>
              <AppText style={styles.successReceiptValue}>
                {state.receiptId}
              </AppText>
            </View>
          )}
          <AppText style={styles.successSubtitle}>
            {state.message ?? 'Dữ liệu đã được gửi tới giảng viên.'}
          </AppText>
        </View>
      )}
      {state.phase === 'error' && (
        <View style={styles.errorBlock}>
          <AppText style={styles.errorTitle}>Không thể điểm danh</AppText>
          <AppText style={styles.errorSubtitle}>
            {state.error ?? 'Vui lòng thử lại sau vài phút.'}
          </AppText>
        </View>
      )}
    </View>
  );
};

const TeacherPanel = ({ state }: { state: TeacherSessionState }) => {
  const isBusy = ['starting', 'registering'].includes(state.phase);
  const waiting = state.phase === 'waiting';

  const statusMeta = (() => {
    switch (state.phase) {
      case 'starting':
        return { label: 'Đang khởi tạo', color: THEME_COLOR.primary };
      case 'registering':
        return { label: 'Đăng ký mã', color: THEME_COLOR.primary };
      case 'waiting':
        return { label: 'Đang phát sóng', color: THEME_COLOR.freshGreen };
      case 'error':
        return { label: 'Gặp lỗi', color: THEME_COLOR.coralRed };
      default:
        return { label: 'Sẵn sàng', color: THEME_COLOR.grey };
    }
  })();

  return (
    <View style={styles.panelCard}>
      <View style={styles.panelHeader}>
        <View>
          <AppText style={styles.panelTitle}>Trạng thái phiên</AppText>
          <AppText style={styles.panelSubtitle}>
            Theo dõi hoạt động phát mã điểm danh đang mở.
          </AppText>
        </View>
        <View
          style={[
            styles.statusPill,
            { backgroundColor: `${statusMeta.color}15` },
          ]}
        >
          <AppText style={[styles.statusPillText, { color: statusMeta.color }]}>
            {statusMeta.label}
          </AppText>
        </View>
      </View>
      <View style={styles.feedbackCard}>
        {isBusy && <ActivityIndicator color={THEME_COLOR.primary} />}
        <AppText style={styles.feedbackText}>
          {state.message ?? 'Đang chuẩn bị...'}
        </AppText>
      </View>

      {state.phase === 'error' && (
        <View style={styles.errorBlock}>
          <AppText style={styles.errorTitle}>Không thể khởi động phiên</AppText>
          <AppText style={styles.errorSubtitle}>
            {state.error ?? state.message ?? 'Vui lòng thử lại.'}
          </AppText>
        </View>
      )}

      <View style={styles.attendeeHeader}>
        <View>
          <AppText style={styles.panelTitle}>Danh sách đã điểm danh</AppText>
          <AppText style={styles.panelSubtitle}>
            {state.attendees.length} sinh viên đã xác nhận thành công.
          </AppText>
        </View>
      </View>
      {state.attendees.length === 0 ? (
        <View style={[styles.placeholderBlock, styles.placeholderPanel]}>
          <AppText style={styles.placeholderTitle}>
            {waiting ? 'Chưa có sinh viên nào' : 'Đang chờ sinh viên...'}
          </AppText>
          <AppText style={styles.placeholderDescription}>
            Danh sách sẽ tự động cập nhật ngay khi có sinh viên hoàn tất điểm
            danh.
          </AppText>
        </View>
      ) : (
        <FlatList
          data={state.attendees}
          keyExtractor={item => item.studentId}
          style={styles.attendeeList}
          contentContainerStyle={styles.attendeeListContainer}
          ItemSeparatorComponent={() => <View style={styles.listDivider} />}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.attendeeRow}>
              <View style={styles.attendeeMeta}>
                <View style={styles.attendeeAvatar}>
                  <AppText style={styles.attendeeAvatarText}>
                    {getInitial(item.name)}
                  </AppText>
                </View>
                <View>
                  <AppText style={styles.attendeeName}>
                    {item.name ?? 'Sinh viên'}
                  </AppText>
                  <AppText style={styles.attendeeId}>{item.studentId}</AppText>
                </View>
              </View>
              <View style={styles.attendeeTimePill}>
                <AppText style={styles.attendeeTime}>
                  {new Date(item.checkedInAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </AppText>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
};

const StepIndicator = ({ label, status }: StepIndicatorProps) => {
  const getItemStyle = (): ViewStyle => {
    switch (status) {
      case 'done':
        return styles.stepItemDone;
      case 'active':
        return styles.stepItemActive;
      default:
        return styles.stepItemPending;
    }
  };

  const getBulletStyle = (): ViewStyle => {
    switch (status) {
      case 'done':
        return styles.stepBulletDone;
      case 'active':
        return styles.stepBulletActive;
      default:
        return styles.stepBulletPending;
    }
  };

  const description =
    status === 'done'
      ? 'Hoàn tất.'
      : status === 'active'
      ? 'Đang xử lý...'
      : 'Chờ bước trước.';

  return (
    <View style={[styles.stepItem, getItemStyle()]}>
      <View style={[styles.stepBullet, getBulletStyle()]}>
        {status === 'done' && <View style={styles.stepBulletDot} />}
      </View>
      <View style={styles.stepTextGroup}>
        <AppText
          style={[
            styles.stepLabel,
            status === 'pending' && styles.stepLabelMuted,
          ]}
        >
          {label}
        </AppText>
        <AppText style={styles.stepDescription}>{description}</AppText>
      </View>
      {status === 'active' && (
        <ActivityIndicator color={THEME_COLOR.primary} size="small" />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 24,
    paddingVertical: 28,
    borderRadius: 28,
    backgroundColor: THEME_COLOR.white,
    width: '92%',
    maxHeight: '90%',
    gap: 20,
    shadowColor: '#0B1533',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.12,
    shadowRadius: 26,
    elevation: 18,
  },
  scrollArea: {
    flexShrink: 1,
  },
  scrollContent: {
    gap: 20,
    paddingBottom: 8,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  header: {
    fontSize: 20,
    fontWeight: '700',
    color: THEME_COLOR.black,
  },
  headerSubtitle: {
    fontSize: 14,
    color: THEME_COLOR.canvasGrey5,
  },
  modeBadge: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  modeBadgeTeacher: {
    backgroundColor: `${THEME_COLOR.primary}15`,
  },
  modeBadgeStudent: {
    backgroundColor: `${THEME_COLOR.freshGreen}18`,
  },
  modeBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME_COLOR.black,
  },
  classCard: {
    backgroundColor: THEME_COLOR.iceGrey,
    borderRadius: 20,
    padding: 18,
    gap: 10,
    borderWidth: 1,
    borderColor: `${THEME_COLOR.canvasGrey}40`,
  },
  classCardEmpty: {
    borderStyle: 'dashed',
    borderColor: THEME_COLOR.lightGrey,
  },
  classCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  classCardLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLOR.grey,
  },
  classCodeChip: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: THEME_COLOR.white,
  },
  classCodeText: {
    fontSize: 13,
    fontWeight: '700',
    color: THEME_COLOR.primary,
  },
  classTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLOR.black,
  },
  classMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  classMetaItem: {
    flexBasis: '48%',
    gap: 4,
  },
  classMetaLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: THEME_COLOR.grey,
  },
  classMetaValue: {
    fontSize: 14,
    color: THEME_COLOR.black,
  },
  panelCard: {
    gap: 16,
    padding: 20,
    borderRadius: 20,
    backgroundColor: THEME_COLOR.backgroundGrey,
    borderWidth: 1,
    borderColor: `${THEME_COLOR.canvasGrey}55`,
  },
  panelTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: THEME_COLOR.black,
  },
  panelSubtitle: {
    fontSize: 13,
    color: THEME_COLOR.canvasGrey5,
    marginTop: 2,
  },
  panelHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 16,
  },
  statusPill: {
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  statusPillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  stepList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 12,
  },
  stepItemDone: {
    backgroundColor: `${THEME_COLOR.freshGreen}18`,
  },
  stepItemActive: {
    backgroundColor: `${THEME_COLOR.primary}13`,
  },
  stepItemPending: {
    backgroundColor: THEME_COLOR.veryLightGrey,
  },
  stepBullet: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
  },
  stepBulletDone: {
    borderColor: THEME_COLOR.freshGreen,
    backgroundColor: `${THEME_COLOR.freshGreen}15`,
  },
  stepBulletActive: {
    borderColor: THEME_COLOR.primary,
    backgroundColor: `${THEME_COLOR.primary}10`,
  },
  stepBulletPending: {
    borderColor: THEME_COLOR.canvasGrey,
    backgroundColor: THEME_COLOR.white,
  },
  stepBulletDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: THEME_COLOR.freshGreen,
  },
  stepTextGroup: {
    flex: 1,
  },
  stepLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: THEME_COLOR.black,
  },
  stepLabelMuted: {
    color: THEME_COLOR.grey,
  },
  stepDescription: {
    fontSize: 12,
    color: THEME_COLOR.canvasGrey5,
    marginTop: 2,
  },
  feedbackCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: THEME_COLOR.white,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: `${THEME_COLOR.canvasGrey}33`,
  },
  feedbackText: {
    fontSize: 14,
    color: THEME_COLOR.black,
    flex: 1,
  },
  successBlock: {
    alignItems: 'center',
    gap: 6,
    backgroundColor: THEME_COLOR.freshGreen + '15',
    borderRadius: 16,
    padding: 16,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: THEME_COLOR.freshGreen,
  },
  successSubtitle: {
    fontSize: 14,
    color: THEME_COLOR.black,
    textAlign: 'center',
  },
  successReceipt: {
    marginTop: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: THEME_COLOR.white,
  },
  successReceiptLabel: {
    fontSize: 12,
    color: THEME_COLOR.grey,
    textAlign: 'center',
  },
  successReceiptValue: {
    fontSize: 14,
    fontWeight: '700',
    color: THEME_COLOR.freshGreen,
    textAlign: 'center',
  },
  errorBlock: {
    backgroundColor: THEME_COLOR.coralRed + '15',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLOR.coralRed,
  },
  errorSubtitle: {
    fontSize: 14,
    color: THEME_COLOR.black,
  },
  attendeeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  attendeeList: {
    maxHeight: 240,
  },
  attendeeListContainer: {
    paddingBottom: 8,
  },
  attendeeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  attendeeMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  attendeeAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: `${THEME_COLOR.primary}16`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  attendeeAvatarText: {
    fontSize: 16,
    fontWeight: '700',
    color: THEME_COLOR.primary,
  },
  attendeeName: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLOR.black,
  },
  attendeeId: {
    fontSize: 13,
    color: THEME_COLOR.grey,
  },
  attendeeTimePill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: `${THEME_COLOR.primaryBlue}22`,
  },
  attendeeTime: {
    fontSize: 13,
    fontWeight: '600',
    color: THEME_COLOR.oceanDepth,
  },
  listDivider: {
    height: 1,
    backgroundColor: THEME_COLOR.lightGrey,
    opacity: 0.4,
  },
  placeholderBlock: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: THEME_COLOR.veryLightGrey,
    gap: 6,
  },
  placeholderPanel: {
    borderWidth: 1,
    borderColor: `${THEME_COLOR.canvasGrey}55`,
  },
  placeholderTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: THEME_COLOR.black,
  },
  placeholderDescription: {
    fontSize: 13,
    color: THEME_COLOR.grey,
  },
});

export default CheckinModal;
