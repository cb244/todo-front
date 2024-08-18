let addItemMode = false;

async function showTasks() {
    const taskList = document.getElementById('task-list');
    const newListItem = document.getElementById("new-item");

    const tasks = await getTasks();
    tasks.forEach(task => {
        let listItem = document.getElementById(task.id);
        if (listItem == null) {
            listItem = createListItem(task);
            taskList.insertBefore(listItem, newListItem);
        }
    });
    newListItem.style.visibility = addItemMode ? "visible" : "hidden";
}

function createListItem(task) {
    const listItem = document.createElement('li');
    listItem.id = task.id;
    if (task.done) {
        listItem.classList.add("done");
    }

    const box = document.createElement('dev');

    const checkButton = document.createElement('button');
    checkButton.classList.add("icon-btn");
    checkButton.classList.add("material-icons");
    checkButton.textContent = task.done == true ? "check_circle" : "radio_button_unchecked";
    checkButton.addEventListener('click', (element) => toggleDone(element));
    box.appendChild(checkButton);

    const contentInput = document.createElement('input');
    contentInput.type = "text";
    contentInput.name = "content";
    contentInput.value = task.content;
    contentInput.addEventListener('focus', (element) => hasTextAreaFocus(element));
    contentInput.addEventListener('blur', (element) => lossTextAreaFocus(element));
    box.appendChild(contentInput);

    listItem.appendChild(box);

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("icon-btn");
    deleteButton.classList.add("material-icons");
    deleteButton.textContent = "delete";
    deleteButton.addEventListener('click', (element) => onClickDelItemButton(element));

    listItem.appendChild(deleteButton);

    return listItem;
}

async function getTasks() {
    let response = await fetch("http://localhost:8080/api/tasks");
    let json = await response.json();
    return json;
}

async function toggleDone(element) {
    const id = element.target.parentNode.parentNode.id;

    let data;
    await axios.get("http://localhost:8080/api/tasks/" + id, data)
        .then(res => {
            data = res.data;
        }).catch(err => {
            console.log("err:", err);
        });

    if (data == null) {
        return;
    }
    data.done = !data.done;

    await axios.put("http://localhost:8080/api/tasks/" + id, data)
        .catch(err => {
            console.log("err:", err);
        });

    await axios.get("http://localhost:8080/api/tasks/" + id, data)
        .then(res => {
            data = res.data;
        }).catch(err => {
            console.log("err:", err);
        });

    element.target.textContent = data.done == true ? "check_circle" : "radio_button_unchecked";
    if (data.done) {
        element.target.parentNode.parentNode.classList.add("done");
    } else {
        element.target.parentNode.parentNode.classList.remove("done");
    }
}

function hasTextAreaFocus(element) {
    element.target.parentNode.classList.add("focus");
}

async function lossTextAreaFocus(element) {
    const id = element.target.parentNode.parentNode.id;

    let data;
    await axios.get("http://localhost:8080/api/tasks/" + id, null)
        .then(res => {
            data = res.data;
        }).catch(err => {
            console.log("err:", err);
        });

    if (data == null) {
        return;
    }

    data.content = element.target.value;

    await axios.put("http://localhost:8080/api/tasks/" + id, data)
        .catch(err => {
            console.log("err:", err);
        });

    await axios.get("http://localhost:8080/api/tasks/" + id, null)
        .then(res => {
            data = res.data;
        }).catch(err => {
            console.log("err:", err);
        });

    element.target.parentNode.classList.remove("focus");
    element.target.value = data.content;
}

async function saveNewItem(element) {
    const newListItem = document.getElementById("new-item");
    const newListItemContent = document.getElementById("new-item-content");
    const content = element.target.value ?? "";
    if (element.target.value != "") {
        let data = {
            done: false,
            content: content,
        };
        await axios.post("http://localhost:8080/api/tasks", data)
            .then(res => {
                data = res.data;
                addItemMode = false;
                newListItemContent.value = "";
            }).catch(err => {
                console.log("err:", err);
                addItemMode = true;
            });
    } else {
        addItemMode = false;
    }
    newListItem.style.visibility = addItemMode ? "visible" : "hidden";

    showTasks();
}

function onClickAddItemButton() {
    if (addItemMode) {
        return;
    }
    addItemMode = true;
    const newListItem = document.getElementById("new-item");
    const newListItemContent = document.getElementById("new-item-content");
    newListItem.style.visibility = addItemMode ? "visible" : "hidden";
    newListItemContent.focus();
}

async function onClickDelItemButton(element) {
    const id = element.target.parentNode.id;
    await axios.delete("http://localhost:8080/api/tasks/" + id, null)
        .catch(err => {
            console.log("err:", err);
        });

    let data;
    await axios.get("http://localhost:8080/api/tasks/" + id, null)
        .then(res => {
            data = res.data;
        }).catch(err => {
            console.log("err:", err);
        });

    if (data == "") {
        element.target.parentNode.remove();
    }
}

window.addEventListener("DOMContentLoaded", async function () {
    addItemMode = false;

    const newListItemContent = document.getElementById("new-item-content");
    newListItemContent.addEventListener('focus', (element) => hasTextAreaFocus(element));
    newListItemContent.addEventListener('blur', (element) => saveNewItem(element));

    const addItemButton = document.getElementById("add-item-button");
    addItemButton.addEventListener("click", (_) => onClickAddItemButton());

    showTasks();
});