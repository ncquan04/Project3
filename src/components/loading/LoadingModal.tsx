import { ActivityIndicator, Modal, View } from 'react-native';

const LoadingModal = (props: { visible: boolean }) => {
  return (
    <View style={{ display: 'contents' }}>
      <Modal
        visible={props.visible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.5)',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <ActivityIndicator size="large" color="#fff" />
        </View>
      </Modal>
    </View>
  );
};

export default LoadingModal;
