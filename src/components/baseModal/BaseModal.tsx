import { ForwardedRef, forwardRef, useImperativeHandle, useState } from 'react';
import {
  Modal,
  ModalProps,
  StatusBar,
  TouchableOpacity,
  View,
  ViewProps,
  ViewStyle,
} from 'react-native';
import CloseIcon from '../../icons/CloseIcon';

export interface BaseModalRefType {
  show: () => void;
  hide: () => void;
}

export interface BaseModalProps extends ModalProps {
  ref: React.ForwardedRef<BaseModalRefType>;
  children: React.ReactNode;
  bodyStyle?: ViewStyle;
  showCloseButton?: boolean;
  touchOutsideToHide?: boolean;
  modelStyle?: ViewStyle;
  bodyProps?: ViewProps;
  transparent?: boolean;
  onRequestClose?: () => void;
}

const BaseModal = ({
  ref: refModal,
  children,
  bodyStyle,
  showCloseButton = true,
  touchOutsideToHide = false,
  modelStyle,
  bodyProps,
  transparent = false,
  onRequestClose,
  ...rest
}: BaseModalProps) => {
  const [showModal, setShowModal] = useState(false);
  useImperativeHandle(refModal, () => ({
    show: () => setShowModal(true),
    hide: () => setShowModal(false),
  }));

  return (
    <View style={{ display: 'contents' }}>
      <Modal
        transparent
        visible={showModal}
        statusBarTranslucent
        onRequestClose={
          onRequestClose ? onRequestClose : () => setShowModal(false)
        }
        {...rest}
      >
        <View
          onTouchEnd={() => touchOutsideToHide && setShowModal(false)}
          style={[
            {
              flex: 1,
              backgroundColor: '#00000090',
              alignItems: 'center',
              justifyContent: 'center',
            },
            modelStyle,
          ]}
        >
          <View
            onTouchEnd={e => e.stopPropagation()}
            style={[
              {
                minHeight: 100,
              },
              bodyStyle,
              !transparent && {
                backgroundColor: '#FFFFFF',
              },
            ]}
            {...bodyProps}
          >
            {showCloseButton && (
              <TouchableOpacity
                onPress={() => {
                  console.log('Close modal');
                  setShowModal(false);
                }}
                style={{
                  padding: 6,
                  position: 'absolute',
                  right: 16,
                  top: 16,
                  backgroundColor: '#88888888',
                  borderRadius: 100,
                }}
              >
                <CloseIcon height={10} width={10} fill={'white'} />
              </TouchableOpacity>
            )}
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default forwardRef(
  (props: Omit<BaseModalProps, 'ref'>, ref: ForwardedRef<BaseModalRefType>) => {
    return <BaseModal {...props} ref={ref} />;
  },
);
