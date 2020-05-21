import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  TouchableHighlight,
  TouchableWithoutFeedback,
  AsyncStorage,
  Image,
} from "react-native";

import styles from "./styles";
import { FontAwesome } from "@expo/vector-icons";

export default function Home() {
  const [listOfTasks, setListOfTasks] = useState([]);
  const [selecteds, setSelecteds] = useState([]);
  const [task, setTask] = useState("");
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    updateList();
  }, []);
  useEffect(() => {
    AsyncStorage.setItem("listOfTasks", JSON.stringify(listOfTasks));
  }, [listOfTasks]);
  async function updateList() {
    let response = await AsyncStorage.getItem("listOfTasks");
    let listOfTasks = (await JSON.parse(response)) || [];
    setListOfTasks(listOfTasks);
    setTask("");
    setLoading(false);
  }
  async function handleSubmit() {
    if (task) {
      setLoading(true);
      setListOfTasks([
        ...listOfTasks,
        {
          id: Date.now(),
          name: task.trim(),
        },
      ]);
      setTask("");
      setLoading(false);
    }
  }
  async function removeTask(id) {
    let newListOfTasks = listOfTasks.filter((item) => item.id !== id);
    setListOfTasks(newListOfTasks);
    let newSelecteds = selecteds.filter((item) => item != id);
    setSelecteds(newSelecteds);
  }
  async function removeMultipleTasks() {
    let newListOfTasks = listOfTasks.filter((item) => {
      if (!selecteds.includes(item.id)) {
        return item;
      }
    });
    setListOfTasks(newListOfTasks);
    setSelecteds([]);
  }
  async function handleSelectedItem(id) {
    if (selecteds.includes(id)) {
      setSelecteds(selecteds.filter((item) => item !== id));
    } else {
      setSelecteds([...selecteds, id]);
    }
  }
  async function deleteListOfTasks() {
    await AsyncStorage.clear();
    setListOfTasks([]);
  }
  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <View style={styles.containerLogo}>
            <Image
              source={require("../../assets/images/logo.png")}
              style={styles.logo}
            />
          </View>
          <TextInput
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType={"done"}
            placeholder="Digite uma tarefa"
            placeholderTextColor="#999"
            style={styles.input}
            value={task}
            onChangeText={setTask}
          />
          <TouchableOpacity style={styles.buttonAddTask} onPress={handleSubmit}>
            <FontAwesome size={24} name="plus" color="#fff" />
          </TouchableOpacity>
        </View>
        {loading && (
          <View style={styles.containerLoading}>
            <Text style={styles.textContainerLoading}>Carregando...</Text>
          </View>
        )}
        <FlatList
          style={styles.containerLists}
          data={listOfTasks}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <View style={styles.containerMessage}>
              <Text style={styles.textMessage}>
                Nenhuma tarefa cadastrada :)
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableWithoutFeedback
              style={{ padding: 10, backgroundColor: "transparent" }}
              onPress={() => handleSelectedItem(item.id)}
            >
              <View
                style={
                  selecteds.includes(item.id)
                    ? styles.taskContainerSelected
                    : styles.taskContainer
                }
              >
                <View style={styles.taskContent}>
                  {selecteds.includes(item.id) && (
                    <FontAwesome name="check" size={20} color="#064450" />
                  )}
                  <Text style={styles.taskText}>{item.name}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    removeTask(item.id);
                  }}
                >
                  <FontAwesome size={24} name="trash" color="#333" />
                </TouchableOpacity>
              </View>
            </TouchableWithoutFeedback>
          )}
        />
      </View>
      {selecteds.length > 0 && (
        <View style={styles.bottomView}>
          <TouchableHighlight
            disabled={selecteds.length > 0 ? false : true}
            style={
              selecteds.length
                ? styles.buttonRemoveTasks
                : styles.buttonRemoveTasksDisable
            }
            onPress={removeMultipleTasks}
          >
            <FontAwesome size={24} name="trash" color="#fff" />
          </TouchableHighlight>
        </View>
      )}
    </>
  );
}
