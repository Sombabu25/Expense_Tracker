import { useState, useMemo } from "react";

const CATEGORIES = ["Food", "Transport", "Rent", "Shopping", "Bills", "Health", "Other"];
const inr = (n) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const today = () => new Date().toISOString().slice(0, 10);

export default function ExpenseTracker() {
  const [items, setItems] = useState([
    { id: 1, title: "Salary", amount: 45000, type: "income", category: "Other", date: today() },
    { id: 2, title: "Groceries", amount: 1850, type: "expense", category: "Food", date: today() },
  ]);
  const [form, setForm] = useState({ title: "", amount: "", type: "expense", category: "Food", date: today() });
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [editId, setEditId] = useState(null);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const add = () => {
    const amount = parseFloat(form.amount);
    if (!form.title.trim() || !(amount > 0)) {
      setError("Enter a title and an amount greater than 0.");
      return;
    }
    setError("");
    const clean = { ...form, title: form.title.trim(), amount };
    if (editId) {
      setItems(items.map((i) => (i.id === editId ? { ...i, ...clean } : i)));
      setEditId(null);
    } else {
      setItems([{ id: Date.now(), ...clean }, ...items]);
    }
    setForm({ ...form, title: "", amount: "" });
  };

  const startEdit = (item) => {
    setEditId(item.id);
    setError("");
    setForm({ title: item.title, amount: String(item.amount), type: item.type, category: item.category, date: item.date });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const cancelEdit = () => {
    setEditId(null);
    setError("");
    setForm({ title: "", amount: "", type: "expense", category: "Food", date: today() });
  };

  const remove = (id) => {
    if (id === editId) cancelEdit();
    setItems(items.filter((i) => i.id !== id));
  };

  const { income, expense, byCat } = useMemo(() => {
    let income = 0, expense = 0;
    const byCat = {};
    items.forEach((i) => {
      if (i.type === "income") income += i.amount;
      else {
        expense += i.amount;
        byCat[i.category] = (byCat[i.category] || 0) + i.amount;
      }
    });
    return { income, expense, byCat };
  }, [items]);

  const shown = items
    .filter((i) => filter === "All" || i.category === filter)
    .sort((a, b) => b.date.localeCompare(a.date) || b.id - a.id);
  const balance = income - expense;
  const field = "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-600";

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <h1 className="text-3xl font-bold text-slate-900">Expense Tracker</h1>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-900 p-4 text-white">
            <p className="text-xs text-slate-300">Balance</p>
            <p className="text-xl font-bold md:text-2xl">{inr(balance)}</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-slate-500">Income</p>
            <p className="text-lg font-bold text-teal-700 md:text-xl">{inr(income)}</p>
          </div>
          <div className="rounded-xl bg-white p-4">
            <p className="text-xs text-slate-500">Expenses</p>
            <p className="text-lg font-bold text-rose-600 md:text-xl">{inr(expense)}</p>
          </div>
        </div>

        <div className="rounded-xl bg-white p-4 space-y-3">
          <h2 className="font-semibold text-slate-800">{editId ? "Edit transaction" : "Add transaction"}</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
            <input className={field + " col-span-2 md:col-span-2"} placeholder="Title" value={form.title} onChange={set("title")} />
            <input className={field} type="number" min="0" placeholder="Amount" value={form.amount} onChange={set("amount")} />
            <select className={field} value={form.type} onChange={set("type")}>
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </select>
            <select className={field} value={form.category} onChange={set("category")}>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
            <input className={field} type="date" value={form.date} onChange={set("date")} />
          </div>
          {error && <p className="text-sm text-rose-600">{error}</p>}
          <div className="flex gap-2">
            <button onClick={add} className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white hover:bg-teal-800">
              {editId ? "Save changes" : "Add transaction"}
            </button>
            {editId && (
              <button onClick={cancelEdit} className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                Cancel
              </button>
            )}
          </div>
        </div>

        {expense > 0 && (
          <div className="rounded-xl bg-white p-4 space-y-2">
            <h2 className="font-semibold text-slate-800">Spending by category</h2>
            {Object.entries(byCat).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => (
              <div key={cat}>
                <div className="flex justify-between text-sm text-slate-600">
                  <span>{cat}</span><span>{inr(amt)}</span>
                </div>
                <div className="h-2 rounded bg-slate-200">
                  <div className="h-2 rounded bg-rose-500" style={{ width: `${(amt / expense) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="rounded-xl bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-semibold text-slate-800">Transactions</h2>
            <select className="rounded-lg border border-slate-300 px-2 py-1 text-sm" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option>All</option>
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          {shown.length === 0 ? (
            <p className="py-6 text-center text-sm text-slate-500">No transactions yet. Add one above.</p>
          ) : (
            <ul className="divide-y divide-slate-200">
              {shown.map((i) => (
                <li key={i.id} className="flex items-center justify-between py-2">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{i.title}</p>
                    <p className="text-xs text-slate-500">{i.category}, {i.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={"text-sm font-semibold " + (i.type === "income" ? "text-teal-700" : "text-rose-600")}>
                      {i.type === "income" ? "+" : "-"}{inr(i.amount)}
                    </span>
                    <button onClick={() => startEdit(i)} aria-label={"Edit " + i.title} className="text-sm text-slate-400 hover:text-teal-700">
                      Edit
                    </button>
                    <button onClick={() => remove(i.id)} aria-label={"Delete " + i.title} className="text-sm text-slate-400 hover:text-rose-600">
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
