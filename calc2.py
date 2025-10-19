import tkinter as tk


BG_COLOR = "#222629"
SCREEN_COLOR = "#e6e6e6"
BTN_COLOR = "#393e46"
BTN_OP_COLOR = "#00adb5"
BTN_EQ_COLOR = "#f8b500"
TXT_COLOR = "#eeeeee"

class TI84Calculator(tk.Tk):
    def __init__(self):
        super().__init__()
        self.title("TI-84 Plus CE Calculator")
        self.geometry("440x600")
        self.configure(bg=BG_COLOR)
        self.resizable(False, False)
        self.expression = ""
        self.ans = ""
        self.memory = ""
        self.degree_mode = True
        self.create_widgets()

    def create_widgets(self):
        # Multi-line display
        self.display = tk.Text(self, font=("Consolas", 18), height=3, width=32, bd=6, relief=tk.RIDGE,
                              bg=SCREEN_COLOR, fg="#222629", state="normal")
        self.display.grid(row=0, column=0, columnspan=5, ipadx=8, ipady=8, padx=12, pady=18, sticky="nsew")
        self.display.insert(tk.END, "0")

        # Expanded button layout (TI-84 style, scientific functions)
        buttons = [
            ["2nd", "Mode", "Del", "Alpha", "Math"],
            ["sin", "cos", "tan", "^", "π"],
            ["7", "8", "9", "/", "Clear"],
            ["log", "ln", "sqrt", "exp", "e"],
            ["4", "5", "6", "*", "("],
            ["x^2", "x^y", "STO", "RCL", "Ans"],
            ["1", "2", "3", "-", ")"],
            ["0", ".", "+", "=", "DRG"],
            ["Y=", "Graph", "", "", ""],
        ]

        for i, row in enumerate(buttons):
            for j, text in enumerate(row):
                if text == "=":
                    btn = tk.Button(self, text=text, font=("Consolas", 16, "bold"), bg=BTN_EQ_COLOR, fg="black",
                                    activebackground=BTN_OP_COLOR, bd=2, relief=tk.RAISED,
                                    command=self.calculate)
                elif text == "Y=":
                    btn = tk.Button(self, text=text, font=("Consolas", 16, "bold"), bg="#222629", fg=BTN_EQ_COLOR,
                                    activebackground=BTN_OP_COLOR, bd=2, relief=tk.RAISED,
                                    command=self.enter_graph)
                elif text == "Graph":
                    btn = tk.Button(self, text=text, font=("Consolas", 16, "bold"), bg=BTN_EQ_COLOR, fg="black",
                                    activebackground=BTN_OP_COLOR, bd=2, relief=tk.RAISED,
                                    command=self.plot_graph)
                elif text in ["+", "-", "*", "/", "^", "x^2", "x^y"]:
                    btn = tk.Button(self, text=text, font=("Consolas", 16, "bold"), bg=BTN_OP_COLOR, fg="white",
                                    activebackground=BTN_EQ_COLOR, bd=2, relief=tk.RAISED,
                                    command=lambda t=text: self.append(t))
                elif text == "Clear":
                    btn = tk.Button(self, text=text, font=("Consolas", 16, "bold"), bg="#393e46", fg=TXT_COLOR,
                                    activebackground=BTN_OP_COLOR, bd=2, relief=tk.RAISED,
                                    command=self.clear)
                elif text == "Del":
                    btn = tk.Button(self, text=text, font=("Consolas", 16, "bold"), bg=BTN_OP_COLOR, fg="white",
                                    activebackground=BTN_EQ_COLOR, bd=2, relief=tk.RAISED,
                                    command=self.backspace)
                elif text in ["sin", "cos", "tan", "log", "ln", "sqrt", "exp", "π", "e", "Ans", "STO", "RCL", "DRG"]:
                    btn = tk.Button(self, text=text, font=("Consolas", 16), bg="#393e46", fg=BTN_EQ_COLOR,
                                    activebackground=BTN_OP_COLOR, bd=2, relief=tk.RAISED,
                                    command=lambda t=text: self.special(t))
                elif text in ["2nd", "Mode", "Alpha", "Math", "(", ")"]:
                    btn = tk.Button(self, text=text, font=("Consolas", 16), bg="#393e46", fg=TXT_COLOR,
                                    activebackground=BTN_OP_COLOR, bd=2, relief=tk.RAISED,
                                    command=lambda t=text: self.append(t))
                elif text == "":
                    continue
                else:
                    btn = tk.Button(self, text=text, font=("Consolas", 16), bg=BTN_COLOR, fg=TXT_COLOR,
                                    activebackground=BTN_OP_COLOR, bd=2, relief=tk.RAISED,
                                    command=lambda t=text: self.append(t))
                btn.grid(row=i+1, column=j, padx=4, pady=4, sticky="nsew")

        for i in range(5):
            self.grid_columnconfigure(i, weight=1, minsize=80)
        for i in range(10):
            self.grid_rowconfigure(i, weight=1, minsize=50)
    def enter_graph(self):
        self.display.delete("1.0", tk.END)
        self.display.insert(tk.END, "Y=")
        self.expression = ""

    def plot_graph(self):
        import matplotlib.pyplot as plt
        import numpy as np
        expr = self.display.get("1.0", tk.END).replace("Y=", "").strip()
        if not expr:
            return
        # Replace math functions for numpy
        expr = expr.replace("sin", "np.sin")
        expr = expr.replace("cos", "np.cos")
        expr = expr.replace("tan", "np.tan")
        expr = expr.replace("log", "np.log10")
        expr = expr.replace("ln", "np.log")
        expr = expr.replace("sqrt", "np.sqrt")
        expr = expr.replace("exp", "np.exp")
        expr = expr.replace("π", "np.pi")
        expr = expr.replace("e", "np.e")
        expr = expr.replace("^", "**")
        x = np.linspace(-10, 10, 400)
        try:
            y = eval(expr, {"np": np, "x": x})
            plt.figure("TI-84 Graph")
            plt.plot(x, y)
            plt.xlabel("x")
            plt.ylabel("y")
            plt.title(f"y = {expr}")
            plt.grid(True)
            plt.show()
        except Exception as e:
            self.display.delete("1.0", tk.END)
            self.display.insert(tk.END, f"Graph Error: {e}")

        for i in range(5):
            self.grid_columnconfigure(i, weight=1, minsize=80)
        for i in range(10):
            self.grid_rowconfigure(i, weight=1, minsize=50)


    def append(self, char):
        if self.display.get("1.0", tk.END).strip() == "0":
            self.display.delete("1.0", tk.END)
        if char == "^":
            self.expression += "**"
        elif char == "x^2":
            self.expression += "**2"
        elif char == "x^y":
            self.expression += "**"
        else:
            self.expression += str(char)
        self.display.delete("1.0", tk.END)
        self.display.insert(tk.END, self.expression)

    def clear(self):
        self.expression = ""
        self.display.delete("1.0", tk.END)
        self.display.insert(tk.END, "0")

    def backspace(self):
        self.expression = self.expression[:-1]
        self.display.delete("1.0", tk.END)
        self.display.insert(tk.END, self.expression if self.expression else "0")

    def special(self, char):
        import math
        if char == "π":
            self.expression += str(math.pi)
        elif char == "e":
            self.expression += str(math.e)
        elif char == "sin":
            self.expression += "math.sin("
        elif char == "cos":
            self.expression += "math.cos("
        elif char == "tan":
            self.expression += "math.tan("
        elif char == "log":
            self.expression += "math.log10("
        elif char == "ln":
            self.expression += "math.log("  # natural log
        elif char == "sqrt":
            self.expression += "math.sqrt("
        elif char == "exp":
            self.expression += "math.exp("
        elif char == "Ans":
            self.expression += getattr(self, "ans", "")
        elif char == "STO":
            self.memory = self.expression
        elif char == "RCL":
            self.expression += getattr(self, "memory", "")
        elif char == "DRG":
            self.degree_mode = not getattr(self, "degree_mode", True)
            mode = "DEG" if self.degree_mode else "RAD"
            self.display.delete("1.0", tk.END)
            self.display.insert(tk.END, mode)
            return
        self.display.delete("1.0", tk.END)
        self.display.insert(tk.END, self.expression)

    def calculate(self):
        import math
        try:
            expr = self.expression
            if getattr(self, "degree_mode", True):
                expr = expr.replace("math.sin(", "math.sin(math.radians(")
                expr = expr.replace("math.cos(", "math.cos(math.radians(")
                expr = expr.replace("math.tan(", "math.tan(math.radians(")
            result = eval(expr)
            self.display.delete("1.0", tk.END)
            self.display.insert(tk.END, str(result))
            self.ans = str(result)
            self.expression = ""
        except Exception:
            self.display.delete("1.0", tk.END)
            self.display.insert(tk.END, "Error")
            self.expression = ""

if __name__ == "__main__":
    app = TI84Calculator()
    app.mainloop()