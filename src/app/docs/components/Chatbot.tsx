// @ts-nocheck
"use client";

import { useState, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { MessageSquare } from "lucide-react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    if (!sessionId) {
      setSessionId(Math.random().toString(36).substring(7));
    }
  }, [sessionId]);

  const messages = useQuery(api.chat.getMessages, { sessionId });
  const sendMessage = useMutation(api.chat.sendMessage);

  const handleSendMessage = () => {
    if (!message) return;
    sendMessage({ message, sessionId });
    setMessage("");
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {isOpen ? (
        <Card className="w-96">
          <CardHeader>
            <CardTitle>AI Assistant</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 overflow-y-auto">
              {messages?.map((msg, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    msg.isUser ? "text-right" : "text-left"
                  }`}
                >
                  <p
                    className={`inline-block rounded-lg px-3 py-2 ${
                      msg.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    }`}
                  >
                    {msg.message}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <Input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Ask a question..."
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Button onClick={() => setIsOpen(true)}>
          <MessageSquare />
        </Button>
      )}
    </div>
  );
}
