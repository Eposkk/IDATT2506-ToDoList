import {Text, View, TextInput,Pressable, Modal } from 'react-native';

const props = {
    styles: StyleSheet,
    modalCategoryAddVisible: Boolean,
    setModalCategoryAddVisible: Function,
    addCategory: Function,
    setCategoryName: Function,
    addCategory: Function,
    
}

export const BaseModal = (props: any) => {
    return (

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCategoryAddVisible}
          onRequestClose={() => {
            setModalCategoryAddVisible(!modalCategoryAddVisible);
          }}
        >
          <View style={props.styles.centeredView}>
            <View style={props.styles.modalView}>
              <Text style={props.styles.modalText}>Fill in name of the new category</Text>
              <TextInput
                style={props.styles.inputCatgeory}
                onChangeText={setCategoryName}
                >

                </TextInput>
              <View style={props.styles.modalButtonView}>
                
                <Pressable
                  style={[props.styles.buttonModal, props.styles.buttonGreen]}
                  onPress={() => addCategory()}
                >
                  <Text style={props.styles.text}>Add</Text>
                </Pressable>
                <Pressable
                  style={props.styles.buttonModal}
                  onPress={() => setModalCategoryAddVisible(!modalCategoryAddVisible)}
                >
                  <Text style={props.styles.text}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
    )
}