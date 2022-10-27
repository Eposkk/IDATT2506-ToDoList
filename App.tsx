import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, FlatList, SafeAreaView, Pressable, Modal, TouchableOpacity } from 'react-native';
import {Task, CategoryTask} from './schemas/types'
import { useState, useEffect } from 'react';
import uuid from 'react-native-uuid';
import { TrashIcon, PlusCircleIcon } from "react-native-heroicons/solid";
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function App() {
 

  const [text, onChangeText] = useState("");
  const [list, onChangeList] = useState<CategoryTask[]>([])
  const [modalDeleteVisible, setModalDeleteVisible] = useState(false);
  const [modalCategoryAddVisible, setModalCategoryAddVisible] = useState(false);
  const [modalCategoryDeleteVisible, setModalCategoryDeleteVisible] = useState(false);
  const [currentIndexDelete, setCurrentIndexDelete] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("0");
  const [categoryName, setCategoryName] = useState("");
  //Altså denne er drittstygg beklager :(
  const [uglyWorkaround, setUglyWorkaround] = useState(0);


  const storeData = async () => {
    try {
      const jsonValue = JSON.stringify(list)
      await AsyncStorage.setItem('@storage_Key', jsonValue)
    } catch (e) {
      // saving error
    }
  }

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@storage_Key')
      return jsonValue != null ? JSON.parse(jsonValue) : null;
    } catch(e) {
      // error reading value
    }
  }

  const fetchData = async () => {
    const data = await getData();
    if(data){
      onChangeList(data);
    }
  }
  
  useEffect(() => {
    fetchData();
    if(list.length != 0){
      setSelectedCategory(list[0].id);
    }
  }, [])

  let flatListRef: FlatList<Task> | null;
  let flatListCategoryRef: FlatList<CategoryTask> | null;
  let textInputRef: TextInput | null;

  const findCatgeoryIndex = (id: string) => {
    let index = 0;
    let inbetweenList = list
    for(let i = 0; i < inbetweenList.length; i++) {
      if(inbetweenList[i].id == id) {
        index= i
      }
    }
    return index
  }

  const findItemIndex = (id: string) => {
    let index = 0;
    let inbetweenList = list
    for(let j = 0; j < inbetweenList[findCatgeoryIndex(selectedCategory)].taskList.length; j++) {
      if(inbetweenList[findCatgeoryIndex(selectedCategory)].taskList[j].id == id) {
        index= j
      }
    }
    return index
  }

  const addToList = () => {
    const newTask : Task = {
      'id': uuid.v4().toString(),
      'title':text,
      'status' : false
    }
    
    let inbetweenList = list

    inbetweenList[findCatgeoryIndex(selectedCategory)].taskList.push(newTask)
    
    let newArray = [...inbetweenList]
    onChangeList(newArray)
    flatListRef?.scrollToEnd({animated: true});
    storeData()
  }

  const removeItem = () => {
    let newArray = list[findCatgeoryIndex(selectedCategory)].taskList.filter((item) => item.id !== currentIndexDelete)
    setModalDeleteVisible(false)
    let originalList = list
    originalList[findCatgeoryIndex(selectedCategory)].taskList = newArray
    onChangeList(originalList)
    storeData()
  }

  const onItemRemovePress = (id: string) => {
    setCurrentIndexDelete(id)
    setModalDeleteVisible(true)
  }

  const onCategoryRemovePress = () => {
    setModalCategoryDeleteVisible(true)
  }

  const onAddCategoryPress = () => {
    setModalCategoryAddVisible(true)
  }

  const addCategory = () => {
    const i = uuid.v4().toString()
    const newCategory : CategoryTask = {
      'id': i.toString(),
      'name': categoryName,
      'taskList':[]
    }
    let newArray = [...list, newCategory]
    onChangeList(newArray)
    setModalCategoryAddVisible(false)
    setSelectedCategory(i.toString())
    if(newArray.length != 1) {
      flatListCategoryRef?.scrollToIndex({animated: true, index: newArray.length - 2});
    }
    storeData()
    
  }

  const deleteCategory = () => {
    
    let newArray = list.filter((item) => item.id !== selectedCategory)
    setModalCategoryDeleteVisible(false)
    onChangeList(newArray)

    if(newArray.length>0){
      setSelectedCategory(newArray[newArray.length-1].id)
      flatListCategoryRef?.scrollToIndex({animated: true, index: newArray.length - 1});
    }
    
    storeData()
  }
  
  const sortTodos = () => {
    const inbetweenList = [...list];
    const sorted = inbetweenList[findCatgeoryIndex(selectedCategory)].taskList.sort((a : Task, b : Task) => {
      return (a.status === b.status) ? 0 : a.status ? -1 : 1;
    })
    inbetweenList[findCatgeoryIndex(selectedCategory)].taskList = sorted;
    onChangeList(inbetweenList);
  };

  const itemActivePress = (id: string) => {
    let newArray = list
    newArray[findCatgeoryIndex(selectedCategory)].taskList[findItemIndex(id)].status = !newArray[findCatgeoryIndex(selectedCategory)].taskList[findItemIndex(id)].status
    onChangeList(newArray)
    setUglyWorkaround(uglyWorkaround + 1)
    sortTodos()
    storeData()
  }


  return (
      <SafeAreaView style={styles.safeAreaView}> 

      <Modal
          animationType="slide"
          transparent={true}
          visible={modalDeleteVisible}
          onRequestClose={() => {
            setModalDeleteVisible(!modalDeleteVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Are you sure you want to delete the task?</Text>
              <View style={styles.modalButtonView}>
                <Pressable
                  style={[styles.buttonModal, styles.buttonRed]}
                  onPress={() => removeItem()}
                >
                  <Text style={styles.text}>Delete</Text>
                </Pressable>
                <Pressable
                  style={styles.buttonModal}
                  onPress={() => setModalDeleteVisible(!modalDeleteVisible)}
                >
                  <Text style={styles.text}>Keep</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>

        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCategoryAddVisible}
          onRequestClose={() => {
            setModalCategoryAddVisible(!modalCategoryAddVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Fill in name of the new category</Text>
              <TextInput
                style={styles.inputCatgeory}
                onChangeText={setCategoryName}
                >

                </TextInput>
              <View style={styles.modalButtonView}>
                
                <Pressable
                  style={[styles.buttonModal, styles.buttonGreen]}
                  onPress={() => addCategory()}
                >
                  <Text style={styles.text}>Add</Text>
                </Pressable>
                <Pressable
                  style={styles.buttonModal}
                  onPress={() => setModalCategoryAddVisible(!modalCategoryAddVisible)}
                >
                  <Text style={styles.text}>Cancel</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>


        <Modal
          animationType="slide"
          transparent={true}
          visible={modalCategoryDeleteVisible}
          onRequestClose={() => {
            setModalCategoryDeleteVisible(!modalCategoryDeleteVisible);
          }}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <Text style={styles.modalText}>Are you sure you want to delete {list[findCatgeoryIndex(selectedCategory)]?.name}</Text>
              <View style={styles.modalButtonView}>
                <Pressable
                  style={[styles.buttonModal, styles.buttonRed]}
                  onPress={() => deleteCategory()}
                >
                  <Text style={styles.text}>Delete</Text>
                </Pressable>
                <Pressable
                  style={styles.buttonModal}
                  onPress={() => setModalCategoryDeleteVisible(!modalCategoryDeleteVisible)}
                >
                  <Text style={styles.text}>Keep</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>


          
        <View style={styles.catgeoryContainer}>
        <FlatList
          horizontal={true}
          data={list}
          renderItem={item => 
            <Pressable onPress={() =>  {setSelectedCategory(item.item.id); flatListCategoryRef?.scrollToIndex({animated: true, index: findCatgeoryIndex(item.item.id), viewOffset: 80})}}> 
              <View style={list[findCatgeoryIndex(selectedCategory)].id===item.item.id ? (styles.itemCategory) : (styles.itemCategorySelected)}> 
                <Text style={styles.title}>{item.item.name}</Text>              
              </View>
            </Pressable>}

  
          keyExtractor={(item) => item.id}
          ref={(ref) => {
            flatListCategoryRef = ref;
          }}
        />
        <Pressable 
        onPress={() => onAddCategoryPress()}
        style={styles.plussIcon}>
          <View>
            <PlusCircleIcon  color="red" fill="black" size={30}/>
          </View>
        </Pressable>
          </View>  
        <View style={styles.container}>
        
        {list.length==0 && (
        <View>
          <Text style={styles.title}>No categories</Text>
          <Text style={styles.modalText}>Press the pluss icon to add a category</Text>
        </View>
      )}

        {list.length != 0 && (
          <View>
            <TextInput
            style={styles.input}
            onChangeText={onChangeText}
            ref={(input) => { textInputRef = input; }}
            onSubmitEditing={ () => { textInputRef?.focus() ; addToList() }}
            value={text}/>
            <Pressable style={styles.button} onPress={addToList}>
              <Text style={styles.text}>Add</Text>
            </Pressable>
          <StatusBar style="auto" />
          </View>
        )}

        {list.length!=0 && (<View
        style={{
          borderBottomColor: 'black',
          borderBottomWidth: 1,
          paddingTop: 15,
        }}
        />)}
        
       
          <View >
            <Text style={styles.title}>{list[findCatgeoryIndex(selectedCategory)]?.name}</Text>
          </View>

          {
            list[findCatgeoryIndex(selectedCategory)]?.taskList.length == 0 && (
              <Pressable onPress={() => onCategoryRemovePress()}>
                <View style={styles.categoryRemoveContainer}> 
                  
                
          <TrashIcon color="red" fill="black" size={30}/>
            
          </View>
          </Pressable>
            )
          }
          
          <FlatList
          data={list[findCatgeoryIndex(selectedCategory)]?.taskList}
          renderItem={item => 
           
              <View style={styles.item}> 
                <Pressable>
                  {item.item.status ? (
                    <TouchableOpacity
                    style={styles.squareActive}
                    onPress={() => itemActivePress(item.item.id)}
                    >
                    </TouchableOpacity>
                  ):(
                    <TouchableOpacity
                    style={styles.square}
                    onPress={() => itemActivePress(item.item.id)}
                    >
                    </TouchableOpacity>
                  )}

                </Pressable>
                <Text style={styles.taskText}

                >{item.item.title}</Text>
                 <Pressable onPress={() => onItemRemovePress(item.item.id)}>
                  <View>
                    <TrashIcon color="red" fill="black" size={30}/>
                  </View>
                 </Pressable>
              </View>}
           

          keyExtractor={item => item.id}
          ref={(ref) => {
            flatListRef = ref;
          }}
          >
          </FlatList>


        
        </View>
      </SafeAreaView>
    
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: '90%',
    height: '100%',
  },
  plussIcon:{
    paddingLeft: 20,
  },
  catgeoryContainer: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  square: {
    width: 30,
    height: 30,
    backgroundColor: 'red',
    opacity: 0.5,
    borderRadius: 5,
  },
  squareActive:{
    width: 30,
    height: 30,
    backgroundColor: 'green',
    opacity: 0.5,
    borderRadius: 5,
  },
  safeAreaView: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    paddingBottom: 50
  },
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    width: '80%',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  modalButtonView: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingVertical: 10,
  },

  titleCategory: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    color: 'black',
    paddingVertical: 10,
  },

  input: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
  },

  inputCatgeory:{
    height: 40,
    margin: 12,
    borderWidth: 1,
    padding: 10,
    minWidth: '70%',
  },

  button: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 10
  },
  buttonModal: {
    alignItems: 'center',
    backgroundColor: '#DDDDDD',
    padding: 10,
    borderRadius: 10,
    marginHorizontal: 10
  },
  buttonRed: {
    backgroundColor: '#FAA0A0',
  },
  buttonGreen: {
    backgroundColor: '#77DD77',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  taskText:{
    fontSize: 18,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },

  categoryRemoveContainer:{
    paddingTop: 20,
    alignItems: 'center',
  },

  itemCategory:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
  },

  itemCategorySelected:{
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 10,
    marginVertical: 8,
    marginHorizontal: 10,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,

    elevation: 3,
    backgroundColor: '#E8E8E8',
  },
});