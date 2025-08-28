"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  RotateCcw,
  Plus,
  Trash2,
  Edit3,
  DollarSign,
  Clock,
  StickyNote,
  Camera,
} from "lucide-react";
import { ConfirmationModal } from "@/components/ui/confirmation-modal";
import { NoteModal } from "@/components/ui/note-modal";
import { Photobooth } from "@/components/ui/photobooth";
import Image from "next/image";

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
}

interface PomodoroSession {
  id: string;
  title: string;
  completedAt: string;
  duration: number; // in minutes
}

export default function PompompurinApp() {
  // Pomodoro Timer State
  const [timeLeft, setTimeLeft] = useState(25 * 60); // 25 minutes in seconds
  const [isRunning, setIsRunning] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);
  const [currentPomodoroTitle, setCurrentPomodoroTitle] = useState("");
  const [pomodoroSessions, setPomodoroSessions] = useState<PomodoroSession[]>(
    []
  );
  const [gifCounter, setGifCounter] = useState(0); // For forcing GIF to reload

  // Notes State
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNoteTitle, setNewNoteTitle] = useState("");
  const [newNoteContent, setNewNoteContent] = useState("");
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [noteModal, setNoteModal] = useState<{
    isOpen: boolean;
    note: Note | null;
  }>({ isOpen: false, note: null });

  // Expense Tracker State
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [newExpenseDescription, setNewExpenseDescription] = useState("");
  const [newExpenseAmount, setNewExpenseAmount] = useState("");
  const [newExpenseCategory, setNewExpenseCategory] = useState("");

  // Confirmation Modal State
  const [confirmationModal, setConfirmationModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Load data from localStorage on mount
  useEffect(() => {
    const savedTimer = localStorage.getItem("pompompurin-timer");
    const savedNotes = localStorage.getItem("pompompurin-notes");
    const savedExpenses = localStorage.getItem("pompompurin-expenses");
    const savedPomodoros = localStorage.getItem("pompompurin-pomodoros");
    const savedPomodoroSessions = localStorage.getItem("pompompurin-sessions");

    if (savedTimer) {
      const timerData = JSON.parse(savedTimer);
      setTimeLeft(timerData.timeLeft);
      setIsBreak(timerData.isBreak);
      setCurrentPomodoroTitle(timerData.currentTitle || "");
    }

    if (savedNotes) {
      setNotes(JSON.parse(savedNotes));
    }

    if (savedExpenses) {
      setExpenses(JSON.parse(savedExpenses));
    }

    if (savedPomodoros) {
      setCompletedPomodoros(parseInt(savedPomodoros));
    }

    if (savedPomodoroSessions) {
      setPomodoroSessions(JSON.parse(savedPomodoroSessions));
    }
  }, []);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setGifCounter((prev) => prev + 1); // Increment counter each second
        setTimeLeft((time) => {
          const newTime = time - 1;
          // Save to localStorage
          localStorage.setItem(
            "pompompurin-timer",
            JSON.stringify({
              timeLeft: newTime,
              isBreak,
              currentTitle: currentPomodoroTitle,
            })
          );
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
      if (!isBreak) {
        // Save completed Pomodoro session
        const completedSession: PomodoroSession = {
          id: Date.now().toString(),
          title: currentPomodoroTitle.trim() || "Untitled Session",
          completedAt: new Date().toLocaleString(),
          duration: 25,
        };
        const updatedSessions = [...pomodoroSessions, completedSession];
        setPomodoroSessions(updatedSessions);
        localStorage.setItem(
          "pompompurin-sessions",
          JSON.stringify(updatedSessions)
        );

        setCompletedPomodoros((prev) => {
          const newCount = prev + 1;
          localStorage.setItem("pompompurin-pomodoros", newCount.toString());
          return newCount;
        });
        setIsBreak(true);
        setTimeLeft(5 * 60); // 5 minute break
        setCurrentPomodoroTitle(""); // Clear title for next session
      } else {
        setIsBreak(false);
        setTimeLeft(25 * 60); // Back to 25 minutes
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, isBreak]);

  // Timer functions
  const toggleTimer = () => setIsRunning(!isRunning);

  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(isBreak ? 5 * 60 : 25 * 60);
    localStorage.setItem(
      "pompompurin-timer",
      JSON.stringify({
        timeLeft: isBreak ? 5 * 60 : 25 * 60,
        isBreak,
        currentTitle: currentPomodoroTitle,
      })
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Pomodoro session functions
  const deletePomodoroSession = (id: string) => {
    const updatedSessions = pomodoroSessions.filter(
      (session) => session.id !== id
    );
    setPomodoroSessions(updatedSessions);
    localStorage.setItem(
      "pompompurin-sessions",
      JSON.stringify(updatedSessions)
    );
  };

  const confirmDeletePomodoroSession = (id: string) => {
    const session = pomodoroSessions.find((s) => s.id === id);
    const sessionTitle = session?.title || "Untitled Session";
    setConfirmationModal({
      isOpen: true,
      title: "Delete Pomodoro Session?",
      message: `Are you sure you want to delete "${sessionTitle}"?`,
      onConfirm: () => {
        deletePomodoroSession(id);
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const clearAllPomodoroSessions = () => {
    setPomodoroSessions([]);
    localStorage.setItem("pompompurin-sessions", JSON.stringify([]));
  };

  // Notes functions
  const addNote = () => {
    if (newNoteTitle.trim() && newNoteContent.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        title: newNoteTitle,
        content: newNoteContent,
        createdAt: new Date().toLocaleDateString(),
      };
      const updatedNotes = [...notes, newNote];
      setNotes(updatedNotes);
      localStorage.setItem("pompompurin-notes", JSON.stringify(updatedNotes));
      setNewNoteTitle("");
      setNewNoteContent("");
    }
  };

  const deleteNote = (id: string) => {
    const updatedNotes = notes.filter((note) => note.id !== id);
    setNotes(updatedNotes);
    localStorage.setItem("pompompurin-notes", JSON.stringify(updatedNotes));
  };

  const confirmDeleteNote = (id: string) => {
    const note = notes.find((n) => n.id === id);
    const noteTitle = note?.title || "Untitled Note";
    setConfirmationModal({
      isOpen: true,
      title: "Delete Note?",
      message: `Are you sure you want to delete "${noteTitle}"?`,
      onConfirm: () => {
        deleteNote(id);
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const updateNote = (id: string, title: string, content: string) => {
    const updatedNotes = notes.map((note) =>
      note.id === id ? { ...note, title, content } : note
    );
    setNotes(updatedNotes);
    localStorage.setItem("pompompurin-notes", JSON.stringify(updatedNotes));
    setEditingNote(null);
  };

  const openNoteModal = (note: Note) => {
    setNoteModal({ isOpen: true, note });
  };

  const closeNoteModal = () => {
    setNoteModal({ isOpen: false, note: null });
  };

  // Expense functions
  const addExpense = () => {
    if (
      newExpenseDescription.trim() &&
      newExpenseAmount &&
      newExpenseCategory.trim()
    ) {
      const newExpense: Expense = {
        id: Date.now().toString(),
        description: newExpenseDescription,
        amount: parseFloat(newExpenseAmount),
        category: newExpenseCategory,
        date: new Date().toLocaleDateString(),
      };
      const updatedExpenses = [...expenses, newExpense];
      setExpenses(updatedExpenses);
      localStorage.setItem(
        "pompompurin-expenses",
        JSON.stringify(updatedExpenses)
      );
      setNewExpenseDescription("");
      setNewExpenseAmount("");
      setNewExpenseCategory("");
    }
  };

  const deleteExpense = (id: string) => {
    const updatedExpenses = expenses.filter((expense) => expense.id !== id);
    setExpenses(updatedExpenses);
    localStorage.setItem(
      "pompompurin-expenses",
      JSON.stringify(updatedExpenses)
    );
  };

  const confirmDeleteExpense = (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    const expenseDescription = expense?.description || "expense";
    setConfirmationModal({
      isOpen: true,
      title: "Delete Expense?",
      message: `Are you sure you want to delete "${expenseDescription}"?`,
      onConfirm: () => {
        deleteExpense(id);
        setConfirmationModal((prev) => ({ ...prev, isOpen: false }));
      },
    });
  };

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  return (
    <>
      {/* Floating Header Bar */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 w-[95%] max-w-7xl fixed-header">
        <div
          className="rounded-xl border-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 shadow-xl flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 md:gap-6 floating-header"
          style={{ borderColor: "#a65c18" }}
        >
          <Image
            src="/images/pompompurin/icon.png"
            alt="Pompompurin"
            width={56}
            height={56}
            className="rounded-full sm:w-10 sm:h-10"
          />
          <h1
            className="text-lg sm:text-xl md:text-2xl font-bold text-center break-words"
            style={{ color: "#a65c18", fontFamily: "Frankfurter, cursive" }}
          >
            RAFA's Productivity Tool
          </h1>
        </div>
      </div>

      <div
        className="min-h-screen p-2 sm:p-4 pt-10 sm:pt-20 md:pt-30"
        style={{ color: "#a65c18", fontFamily: "Frankfurter, cursive" }}
      >
        <div className="max-w-6xl mx-auto">
          <Tabs defaultValue="timer" className="w-full">
            <TabsList
              className="grid w-full grid-cols-4 mb-6 gap-1"
              style={{ backgroundColor: "#f5e6a3" }}
            >
              <TabsTrigger
                value="timer"
                className="flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden xs:inline">Pomodoro </span>Timer
              </TabsTrigger>
              <TabsTrigger
                value="notes"
                className="flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <StickyNote className="w-4 h-4" />
                Notes
              </TabsTrigger>
              <TabsTrigger
                value="expenses"
                className="flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <span className="text-base leading-none mt-0.5">₱</span>{" "}
                Expenses
              </TabsTrigger>
              <TabsTrigger
                value="photobooth"
                className="flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                <Camera className="w-4 h-4" />
                <span className="hidden xs:inline">Photo</span>Booth
              </TabsTrigger>
            </TabsList>

            <TabsContent value="timer">
              <div className="space-y-6">
                <Card className="border-2 pompompurin-border pompompurin-card">
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl">
                      {isBreak ? "🐳 Break Time!" : "🦦 Focus Time!"}
                    </CardTitle>
                    <Badge variant="secondary" className="mx-auto w-fit">
                      Completed Pomodoros: {completedPomodoros}
                    </Badge>
                  </CardHeader>
                  <CardContent className="text-center space-y-6">
                    {!isBreak && (
                      <div className="space-y-2">
                        <Input
                          placeholder="What are you working on? (optional)"
                          value={currentPomodoroTitle}
                          onChange={(e) =>
                            setCurrentPomodoroTitle(e.target.value)
                          }
                          style={{ borderColor: "#a65c18" }}
                          className="text-center"
                          disabled={isRunning}
                        />
                      </div>
                    )}
                    <div
                      className="text-6xl sm:text-7xl md:text-8xl font-bold"
                      style={{ color: "#a65c18" }}
                    >
                      {formatTime(timeLeft)}
                    </div>

                    {isRunning && (
                      <div className="flex justify-center my-2">
                        <img
                          src="/images/pompompurin/icon.png"
                          alt="Pompompurin"
                          width={80}
                          height={80}
                          className="pomodoro-active-image rounded-full"
                        />
                      </div>
                    )}

                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                      <Button
                        onClick={toggleTimer}
                        size="lg"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto pompompurin-button"
                        style={{ backgroundColor: "#a65c18", color: "#fefcac" }}
                      >
                        {isRunning ? (
                          <Pause className="w-5 h-5" />
                        ) : (
                          <Play className="w-5 h-5" />
                        )}
                        {isRunning ? "Pause" : "Start"}
                      </Button>
                      <Button
                        onClick={resetTimer}
                        size="lg"
                        variant="outline"
                        className="flex items-center justify-center gap-2 w-full sm:w-auto"
                        style={{ borderColor: "#a65c18", color: "#a65c18" }}
                      >
                        <RotateCcw className="w-5 h-5" />
                        Reset
                      </Button>
                    </div>
                  </CardContent>
                </Card>

                {pomodoroSessions.length > 0 && (
                  <Card className="border-2 pompompurin-border pompompurin-card">
                    <CardHeader>
                      <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                          🏆 Completed Sessions
                        </CardTitle>
                        <Button
                          onClick={clearAllPomodoroSessions}
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-800"
                          style={{ borderColor: "#a65c18" }}
                        >
                          Clear All
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 max-h-60 overflow-y-auto">
                        {pomodoroSessions
                          .slice()
                          .reverse()
                          .map((session) => (
                            <div
                              key={session.id}
                              className="flex justify-between items-center p-3 rounded-lg"
                              style={{ backgroundColor: "#f9f4a1" }}
                            >
                              <div className="flex-1">
                                <h3 className="font-semibold text-sm">
                                  {session.title}
                                </h3>
                                <p className="text-xs opacity-70">
                                  {session.duration} min • {session.completedAt}
                                </p>
                              </div>
                              <Button
                                onClick={() =>
                                  confirmDeletePomodoroSession(session.id)
                                }
                                size="sm"
                                variant="ghost"
                                className="text-red-500 hover:text-red-700"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            <TabsContent value="notes">
              <div className="space-y-6">
                <Card className="border-2 pompompurin-border pompompurin-card w-full mx-auto">
                  <CardHeader className="px-3 sm:px-6">
                    <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                      <Edit3 className="w-4 sm:w-5 h-4 sm:h-5" />
                      Add New Note
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 px-3 sm:px-6 py-2 sm:py-4">
                    <Input
                      placeholder="Note title..."
                      value={newNoteTitle}
                      onChange={(e) => setNewNoteTitle(e.target.value)}
                      style={{ borderColor: "#a65c18" }}
                    />
                    <Textarea
                      placeholder="Write your note here..."
                      value={newNoteContent}
                      onChange={(e) => setNewNoteContent(e.target.value)}
                      rows={4}
                      style={{ borderColor: "#a65c18" }}
                    />
                    <Button
                      onClick={addNote}
                      className="flex items-center gap-2 pompompurin-button"
                      style={{ backgroundColor: "#a65c18", color: "#fefcac" }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Note
                    </Button>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                  {notes.map((note) => {
                    const shouldTruncate =
                      note.title.length > 50 || note.content.length > 150;
                    const truncatedTitle =
                      note.title.length > 50
                        ? note.title.substring(0, 50) + "..."
                        : note.title;
                    const truncatedContent =
                      note.content.length > 150
                        ? note.content.substring(0, 150) + "..."
                        : note.content;

                    return (
                      <Card
                        key={note.id}
                        className="border-2 pompompurin-border pompompurin-card cursor-pointer hover:shadow-lg transition-shadow w-full mx-auto"
                        onClick={() => openNoteModal(note)}
                      >
                        <CardHeader className="pb-2 px-3 sm:px-6">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg break-words flex-1 pr-2 line-clamp-2">
                              {shouldTruncate ? truncatedTitle : note.title}
                            </CardTitle>
                            <Button
                              onClick={(e) => {
                                e.stopPropagation();
                                confirmDeleteNote(note.id);
                              }}
                              size="sm"
                              variant="ghost"
                              className="text-red-500 hover:text-red-700 flex-shrink-0"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          <p className="text-sm opacity-70">{note.createdAt}</p>
                        </CardHeader>
                        <CardContent className="px-3 sm:px-6 py-2 sm:py-4">
                          <p className="whitespace-pre-wrap break-words line-clamp-3">
                            {shouldTruncate ? truncatedContent : note.content}
                          </p>
                          {shouldTruncate && (
                            <p className="text-sm opacity-50 mt-2 italic">
                              Click to view full note
                            </p>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {notes.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-xl">
                      📝 No notes yet! Add your first note above.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="expenses">
              <div className="space-y-6">
                <Card className="border-2 pompompurin-border pompompurin-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Plus className="w-5 h-5" />
                      Add New Expense
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                      <Input
                        placeholder="Description..."
                        value={newExpenseDescription}
                        onChange={(e) =>
                          setNewExpenseDescription(e.target.value)
                        }
                        style={{ borderColor: "#a65c18" }}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Amount..."
                        value={newExpenseAmount}
                        onChange={(e) => setNewExpenseAmount(e.target.value)}
                        style={{ borderColor: "#a65c18" }}
                      />
                      <Input
                        placeholder="Category..."
                        value={newExpenseCategory}
                        onChange={(e) => setNewExpenseCategory(e.target.value)}
                        style={{ borderColor: "#a65c18" }}
                        className="sm:col-span-2 md:col-span-1"
                      />
                    </div>
                    <Button
                      onClick={addExpense}
                      className="flex items-center gap-2 pompompurin-button"
                      style={{ backgroundColor: "#a65c18", color: "#fefcac" }}
                    >
                      <Plus className="w-4 h-4" />
                      Add Expense
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 pompompurin-border pompompurin-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Total Expenses: ₱ {totalExpenses.toFixed(2)}
                    </CardTitle>
                  </CardHeader>
                </Card>

                <div className="space-y-3">
                  {expenses.map((expense) => (
                    <Card
                      key={expense.id}
                      className="border-2 pompompurin-border pompompurin-card"
                    >
                      <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-3">
                        <div className="flex-1 w-full">
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                            <h3 className="font-semibold">
                              {expense.description}
                            </h3>
                            <Badge variant="secondary">
                              {expense.category}
                            </Badge>
                          </div>
                          <p className="text-sm opacity-70">{expense.date}</p>
                        </div>
                        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
                          <span className="text-xl font-bold">
                            ₱{expense.amount.toFixed(2)}
                          </span>
                          <Button
                            onClick={() => confirmDeleteExpense(expense.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {expenses.length === 0 && (
                  <div className="text-center py-12">
                    <p className="text-xl">
                      💰 No expenses tracked yet! Add your first expense above.
                    </p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="photobooth">
              <div className="space-y-6">
                <Card className="border-2 pompompurin-border pompompurin-card">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Photobooth
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Photobooth />
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>

          <footer className="text-center mt-12 py-6">
            <p className="text-lg">
              🪐 I love you to the moon and to saturn 🪐
            </p>
          </footer>
        </div>

        <ConfirmationModal
          isOpen={confirmationModal.isOpen}
          onClose={() =>
            setConfirmationModal((prev) => ({ ...prev, isOpen: false }))
          }
          onConfirm={confirmationModal.onConfirm}
          title={confirmationModal.title}
          message={confirmationModal.message}
        />

        <NoteModal
          isOpen={noteModal.isOpen}
          onClose={closeNoteModal}
          title={noteModal.note?.title || ""}
          content={noteModal.note?.content || ""}
          createdAt={noteModal.note?.createdAt || ""}
        />
      </div>
    </>
  );
}
