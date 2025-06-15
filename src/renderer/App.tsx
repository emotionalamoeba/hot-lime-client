import React, { useEffect, useState } from "react";

import { Col, Container, Row } from "react-bootstrap";
import { ControlPanel } from "./components/ControlPanel.js";
import { useAppDispatch } from "../shared/hooks.js";
import { setServerAddress } from "../shared/features/settings/settingsSlice.js";
import { StatusPanel } from "./components/StatusPanel.js";
import { ConversationList } from "./components/ConversationList.js";
import { selectSessionIDS } from "../shared/features/session/sessionSlice.js";
import { ConversationHistory } from "./components/ConversationHistory.js";

interface Message {
  from: string;
  text: string;
}

export function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    window.hotlineAPI.getStoreValue("serverAddress").then((value: string) => {
      console.log(`Attempting to set value to ${value}`);
      dispatch(setServerAddress(value));
    });
  }, []);

  const [userName, setUserName] = useState("Electron");

  const [count, setCount] = useState(0);
  // const [messages, setMessages] = useState([])
  const [messageInputText, setMessageInputText] = useState("");

  const handleInput = (event) => {
    setMessageInputText(event.target.value);
  };

  const handleKey = (event) => {
    if (event.keyCode === 13) {
      sendMessage(messageInputText);
      setMessageInputText("");
    }
  };

  const sendMessage = (text: string) => {
    console.log("sending outbound public message");

    window.hotlineAPI
      .sendPublicMessage(text)
      .then(() => {
        //      messages.push({ 'from': 'Me', 'text': text } as Message);
      })
      .catch(() => {
        //     messages.push({ 'from': 'Send Error', 'text': '' } as Message);
      });
  };

  const notifyChangeUser = (userID: number, userName: string) => {
    console.log(`Change user with id ${JSON.stringify(userID)} to ${userName}`);
  };

  const notifyDeleteUser = (userID: number) => {
    console.log(`Remove user with id ${userID}`);
  };

  useEffect(() => {
    window.hotlineAPI.receive(
      "connection:notifyChangeUser",
      (change: { userID: number; userName: string }) => {
        notifyChangeUser(change.userID, change.userName);
      }
    );

    window.hotlineAPI.receive(
      "connection:notifyDeleteUser",
      (userID: number) => {
        notifyDeleteUser(userID);
      }
    );
  }, []);

  window.hotlineAPI.receive("hotKeyPressed", (key) => {
    // Handle hotkey press in Vue file
    console.log(`Server says ${JSON.stringify(key)}`);

    // setCount(10000);
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((c) => c + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <Container className="p-3">
      <Row>
        <Col>
          <ControlPanel />
          <StatusPanel />
        </Col>
      </Row>
      <Row>
        <Col>
          <ConversationList />
        </Col>
        <Col xs={9}>
          <ConversationHistory />
        </Col>
      </Row>
      <Row>
        <input
          placeholder="Lets talk"
          onChange={handleInput}
          onKeyUp={handleKey}
        />
        <div>{messageInputText}</div>
      </Row>
    </Container>
  );
}
