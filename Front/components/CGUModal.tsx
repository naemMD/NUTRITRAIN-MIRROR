import React, { useState, useRef, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { TERMS_OF_SERVICE_TEXT, PRIVACY_POLICY_TEXT } from '@/constants/cguContent';

type ContentType = 'terms' | 'privacy';

interface CGUModalProps {
  visible: boolean;
  onClose: () => void;
  /** If provided, shows Accept/Decline buttons. Accept only enabled after scrolling to the end. */
  onAccept?: () => void;
  /** Which content to display */
  contentType: ContentType;
  /** Called when the user taps the Privacy Policy link inside the Terms of Service */
  onOpenPrivacyPolicy?: () => void;
}

const PRIVACY_LINK_MARKER = 'please review our Privacy Policy.';

const CONTENT_MAP: Record<ContentType, { title: string; text: string }> = {
  terms: { title: 'Terms of Service', text: TERMS_OF_SERVICE_TEXT },
  privacy: { title: 'Privacy Policy', text: PRIVACY_POLICY_TEXT },
};

/**
 * Renders the text content. If contentType is 'terms', the "Privacy Policy" mention
 * in section 4.2 becomes a clickable link that triggers onOpenPrivacyPolicy.
 */
const RenderContent = ({
  text,
  contentType,
  onOpenPrivacyPolicy,
}: {
  text: string;
  contentType: ContentType;
  onOpenPrivacyPolicy?: () => void;
}) => {
  if (contentType === 'terms' && onOpenPrivacyPolicy && text.includes(PRIVACY_LINK_MARKER)) {
    const parts = text.split(PRIVACY_LINK_MARKER);
    return (
      <Text style={styles.cguText}>
        {parts[0]}
        please review our{' '}
        <Text style={styles.privacyLink} onPress={onOpenPrivacyPolicy}>
          Privacy Policy
        </Text>
        .{parts[1]}
      </Text>
    );
  }
  return <Text style={styles.cguText}>{text}</Text>;
};

const CGUModal: React.FC<CGUModalProps> = ({
  visible,
  onClose,
  onAccept,
  contentType,
  onOpenPrivacyPolicy,
}) => {
  const [hasScrolledToEnd, setHasScrolledToEnd] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  const { title, text } = CONTENT_MAP[contentType];

  useEffect(() => {
    if (visible) {
      setHasScrolledToEnd(false);
    }
  }, [visible, contentType]);

  const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = event.nativeEvent;
    const isAtEnd = layoutMeasurement.height + contentOffset.y >= contentSize.height - 40;
    if (isAtEnd && !hasScrolledToEnd) {
      setHasScrolledToEnd(true);
    }
  };

  const handleClose = () => {
    setHasScrolledToEnd(false);
    onClose();
  };

  const handleAccept = () => {
    setHasScrolledToEnd(false);
    onAccept?.();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent statusBarTranslucent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{title}</Text>
            <TouchableOpacity onPress={handleClose} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Ionicons name="close" size={26} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Scrollable content */}
          <ScrollView
            ref={scrollViewRef}
            style={styles.scrollView}
            contentContainerStyle={styles.scrollContent}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={true}
          >
            <RenderContent
              text={text}
              contentType={contentType}
              onOpenPrivacyPolicy={onOpenPrivacyPolicy}
            />
          </ScrollView>

          {/* Scroll hint when acceptance is required and user hasn't scrolled to end */}
          {!hasScrolledToEnd && onAccept && (
            <View style={styles.scrollHint}>
              <Ionicons name="chevron-down" size={16} color="#3498DB" />
              <Text style={styles.scrollHintText}>Scroll down to read the full document</Text>
              <Ionicons name="chevron-down" size={16} color="#3498DB" />
            </View>
          )}

          {/* Footer buttons */}
          <View style={styles.footer}>
            {onAccept ? (
              <>
                <TouchableOpacity style={styles.declineButton} onPress={handleClose}>
                  <Text style={styles.declineButtonText}>Decline</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.acceptButton, !hasScrolledToEnd && styles.acceptButtonDisabled]}
                  onPress={handleAccept}
                  disabled={!hasScrolledToEnd}
                >
                  <Text style={[styles.acceptButtonText, !hasScrolledToEnd && styles.acceptButtonTextDisabled]}>
                    Accept
                  </Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
                <Text style={styles.closeButtonText}>Close</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContainer: {
    backgroundColor: '#1A1F2B',
    borderRadius: 20,
    width: '100%',
    maxHeight: '90%',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#2A4562',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2A4562',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
  },
  scrollView: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    padding: 20,
  },
  cguText: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 22,
  },
  privacyLink: {
    color: '#3498DB',
    textDecorationLine: 'underline',
    fontWeight: 'bold',
  },
  scrollHint: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 8,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: '#2A4562',
  },
  scrollHintText: {
    color: '#3498DB',
    fontSize: 12,
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#2A4562',
  },
  acceptButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  acceptButtonDisabled: {
    backgroundColor: '#2A4562',
    opacity: 0.5,
  },
  acceptButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  acceptButtonTextDisabled: {
    color: '#8A8D91',
  },
  declineButton: {
    flex: 1,
    backgroundColor: 'transparent',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#555',
  },
  declineButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
  },
  closeButton: {
    flex: 1,
    backgroundColor: '#3498DB',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  closeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CGUModal;
