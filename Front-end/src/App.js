import React, { createContext, useContext, useReducer, useEffect, useState, useRef } from 'react';

import './App.css' 
<script src="https://cdn.jsdelivr.net/npm/bootstrap@4.3.1/dist/js/bootstrap.min.js" integrity="sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM" crossorigin="anonymous"></script>
const HOST_API = "http://localhost:8080/api"

const initialState = {
  list: [],
  item: {}
};


const Store = createContext(initialState)

const Form = () => {

  //useRef: permite identificar las propiedades de un
  //componente en especifico 
  const formRef = useRef(null);

  const { dispatch, state: { item } } = useContext(Store);

  const [state, setState] = useState(item)


  const onAdd = (event) => {
    //event.preventDefault();

    const request = {
      name: state.name,
      id: null,
      isCompleted: false
    };

    fetch(HOST_API + "/todo", {
      method: "POST",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "add-item", item: todo });
        setState({ name: "" });
        formRef.current.reset();
      });
  }

  const onEdit = (event) => {
    //event.preventDefault();

    const request = {
      name: state.name,
      id: item.id,
      isCompleted: item.isCompleted
    };

    fetch(HOST_API + "/todo", {
      method: "PUT",
      body: JSON.stringify(request),
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then((todo) => {
        dispatch({ type: "update-item", item: todo });
        setState({ name: "" });
        formRef.current.reset();
      });
  }

  return <form ref={formRef}>
    <input type="text" name="name" defaultValue={item.name} onChange={(event) => {
      setState({ ...state, name: event.target.value })
    }}></input>

    
    {item.id && <button class="btnActualizar btnNuevo" onClick={onEdit} ></button>}
    {!item.id && <button class="btnAgregar btnNuevo" onClick={onAdd}></button>}

  </form>
}

const List = () => {
  //Un store es una almacen para guardar los
  //estado de una apliacion
  const { dispatch, state } = useContext(Store);;

  useEffect(() => {
    fetch(HOST_API + "/todos")
      .then(response => response.json())
      .then((list) => {
        dispatch({ type: "update-list", list })
      })
  }, [state.list.length, dispatch]);

  const onDelete = (id) => {
    fetch(HOST_API + "/" + id + "/todo", {
      method: "DELETE"
    })
      .then((list) => {
        dispatch({ type: "delete-item", id })
      })
  };

  const onEdit = (todo) => {
    dispatch({ type: "edit-item", item: todo })
  };

  return <div>
    <table class="table">
      <thead>
        <tr>
          <td>ID</td>
          <td>Nombre</td>
          <td>¿Esta completado?</td>
          <td>Editar</td>
          <td>Eliminar</td>
          
        </tr>
      </thead>
      <tbody>
        {state.list.map((todo) => {
          return <tr key={todo.id}>
            <td>{todo.id}</td>
            <td>{todo.name}</td>
            <td>{todo.isCompleted === true ? "SI" : "NO"}</td>
            <td><button class="btnEditar btnNuevo" onClick={() => onEdit(todo)}></button></td>
            <td><button class="btnEliminar btnNuevo" onClick={() => onDelete(todo.id)}></button></td>
            
          </tr>
        })}
      </tbody>
    </table>
  </div>
}

//
function reducer(state, action) {
  switch (action.type) {
    case 'update-item':
      const listUpdateEdit = state.list.map((item) => {
        if (item.id === action.item.id) {
          return action.item;
        }
        return item;
      });
      return { ...state, list: listUpdateEdit, item: {} }
    case 'delete-item':
      const listUpdate = state.list.filter((item) => {
        return item.id !== action.id;
      });
      return { ...state, list: listUpdate }
    case 'update-list':
      return { ...state, list: action.list }
    case 'edit-item':
      return { ...state, item: action.item }
    case 'add-item':
      const newList = state.list;
      newList.push(action.item);
      return { ...state, list: newList }
    default:
      return state;

  }
}

//nos permite conectar entre si, diferentes componentes
const StoreProvider = ({ children }) => {

  //useReducer: nos ayuda a administrar el reducer
  const [state, dispatch] = useReducer(reducer, initialState);

  //dispatch: notifica al reducer que cambios quiere
  //que pase en el sistema orientado a una acción
  return <Store.Provider value={{ state, dispatch }}>
    {children}
  </Store.Provider>
}

function App() {
  return (
    <StoreProvider>
      <Form />
      <List />
    </StoreProvider>
  );
}

export default App;
