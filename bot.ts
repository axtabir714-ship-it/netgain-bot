import { Telegraf, Markup } from "telegraf";
import Database from "better-sqlite3";

/* ================= CONFIG ================= */
const BOT_TOKEN = "8383631383:AAHPHg-QMId9NM2nBNzcaL_L3XT9AWvC_6w";
const ADMIN_ID = 7076284067;
const PAYMENT_NUMBER = "01902954758";
const MIN_WITHDRAW = 100;

const bot = new Telegraf(BOT_TOKEN);
const db = new Database("data.db");

/* ================= DATABASE ================= */
db.prepare(`
CREATE TABLE IF NOT EXISTS users (
 id INTEGER PRIMARY KEY,
 balance INTEGER DEFAULT 0,
 referrer INTEGER,
 premium INTEGER DEFAULT 0,
 step TEXT,
 w_amount INTEGER,
 w_method TEXT
)
`).run();

db.prepare(`
CREATE TABLE IF NOT EXISTS withdraws (
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 user_id INTEGER,
 amount INTEGER,
 method TEXT,
 number TEXT,
 status TEXT
)
`).run();

/* ================= HELPERS ================= */
const getUser = (id:number)=>
 db.prepare("SELECT * FROM users WHERE id=?").get(id) as any;

const addUser = (id:number, ref?:number)=>{
 if(!getUser(id)){
  db.prepare(
   "INSERT INTO users (id,referrer) VALUES (?,?)"
  ).run(id, ref || null);
 }
};

const setStep = (id:number, step:any)=>{
 db.prepare(
  "UPDATE users SET step=? WHERE id=?"
 ).run(step, id);
};

/* ================= START ================= */
bot.start(ctx=>{
 const id = ctx.from!.id;
 const ref = ctx.startPayload ? Number(ctx.startPayload) : undefined;

 addUser(id, ref);

 ctx.reply(
  "👋 Welcome",
  Markup.keyboard([
   ["⭐ Premium","💰 Balance"],
   ["📤 Withdraw","📊 Income"],
   ["👥 Team","🔗 Referral Link"]
  ]).resize()
 );
});

/* ================= BALANCE ================= */
bot.hears("💰 Balance", ctx=>{
 const u = getUser(ctx.from!.id);
 ctx.reply(`💰 Balance: ${u.balance}৳`);
});

/* ================= INCOME ================= */
bot.hears("📊 Income", ctx=>{
 const u = getUser(ctx.from!.id);
 ctx.reply(`📊 Income: ${u.balance}৳`);
});

/* ================= PREMIUM ================= */
bot.hears("⭐ Premium", ctx=>{
 const id = ctx.from!.id;
 setStep(id,"trx");

 ctx.reply(
`⭐ Premium 100৳ পাঠান
📱 ${PAYMENT_NUMBER}

TRX ID পাঠান`
 );
});

/* ================= WITHDRAW ================= */
bot.hears("📤 Withdraw", ctx=>{
 const id = ctx.from!.id;
 const u = getUser(id);

 if(!u.premium) return ctx.reply("❌ Premium লাগবে");

 setStep(id,"w_amount");
 ctx.reply("Amount লিখুন");
});

/* ================= TEAM ================= */
bot.hears("👥 Team", ctx=>{
 const id = ctx.from!.id;

 const g1 = db.prepare(
  "SELECT COUNT(*) c FROM users WHERE referrer=?"
 ).get(id) as any;

 const g2 = db.prepare(`
  SELECT COUNT(*) c FROM users
  WHERE referrer IN (
   SELECT id FROM users WHERE referrer=?
  )
 `).get(id) as any;

 const g3 = db.prepare(`
  SELECT COUNT(*) c FROM users
  WHERE referrer IN (
   SELECT id FROM users WHERE referrer IN
    (SELECT id FROM users WHERE referrer=?)
  )
 `).get(id) as any;

 ctx.reply(
`👥 Team

G1: ${g1.c}
G2: ${g2.c}
G3: ${g3.c}`
 );
});

/* ================= REF LINK ================= */
bot.hears("🔗 Referral Link", ctx=>{
 const id = ctx.from!.id;
 const u = getUser(id);

 if(!u.premium) return ctx.reply("Premium লাগবে");

 ctx.reply(`https://t.me/@NetgainBot?start=${id}`);
});

/* ================= TEXT STEPS ================= */
bot.on("text", ctx=>{
 const id = ctx.from!.id;
 const u = getUser(id);
 const txt = ctx.message.text;

/* ===== TRX ===== */
 if(u.step==="trx"){
  setStep(id,null);

  bot.telegram.sendMessage(
   ADMIN_ID,
`⭐ Premium Request

User: ${id}
TRX: ${txt}`,
   Markup.inlineKeyboard([
    Markup.button.callback("Approve",`p_${id}`)
   ])
  );

  return ctx.reply("Sent to admin");
 }

/* ===== WITHDRAW AMOUNT ===== */
 if(u.step==="w_amount"){
  const amt = Number(txt);

  if(isNaN(amt) || amt < MIN_WITHDRAW)
   return ctx.reply(`❌ Minimum ${MIN_WITHDRAW}`);

  if(u.balance < amt)
   return ctx.reply("❌ Balance low");

  db.prepare(
   "UPDATE users SET w_amount=?,step=? WHERE id=?"
  ).run(amt,"w_method",id);

  return ctx.reply("📱 Method লিখুন: bKash / Nagad");
 }

/* ===== METHOD ===== */
 if(u.step==="w_method"){
  const m = txt.toLowerCase();

  if(m!=="bkash" && m!=="nagad")
   return ctx.reply("❌ bKash/Nagad লিখুন");

  db.prepare(
   "UPDATE users SET w_method=?,step=? WHERE id=?"
  ).run(m,"w_number",id);

  return ctx.reply("📞 Payment number দিন");
 }

/* ===== NUMBER ===== */
 if(u.step==="w_number"){
  setStep(id,null);

  const info = db.prepare(`
   INSERT INTO withdraws
   (user_id,amount,method,number,status)
   VALUES (?,?,?,?,?)
  `).run(id,u.w_amount,u.w_method,txt,"pending");

  bot.telegram.sendMessage(
   ADMIN_ID,
`💸 Withdraw Request

User: ${id}
Amount: ${u.w_amount}
Method: ${u.w_method}
Number: ${txt}`,
   Markup.inlineKeyboard([
    Markup.button.callback("Approve",`wok_${info.lastInsertRowid}`),
    Markup.button.callback("Reject",`wno_${info.lastInsertRowid}`)
   ])
  );

  return ctx.reply("Request sent");
 }
});

/* ================= PREMIUM APPROVE (UPDATED COMMISSION) ================= */
bot.action(/p_(\d+)/, ctx=>{
 if(ctx.from!.id !== ADMIN_ID) return;

 const uid = Number(ctx.match[1]);

 // Premium active
 db.prepare(
  "UPDATE users SET premium=1 WHERE id=?"
 ).run(uid);

 // ✅ ADMIN commission
 db.prepare(
  "UPDATE users SET balance = balance + 40 WHERE id=?"
 ).run(ADMIN_ID);

 const u = getUser(uid);
 const g1 = u.referrer;

 if(g1){
  db.prepare(
   "UPDATE users SET balance = balance + 40 WHERE id=?"
  ).run(g1);

  const g1u = getUser(g1);

  if(g1u?.referrer){
   db.prepare(
    "UPDATE users SET balance = balance + 6 WHERE id=?"
   ).run(g1u.referrer);

   const g2u = getUser(g1u.referrer);

   if(g2u?.referrer){
    db.prepare(
     "UPDATE users SET balance = balance + 4 WHERE id=?"
    ).run(g2u.referrer);
   }
  }
 }

 ctx.editMessageText("✅ Premium Approved");
 bot.telegram.sendMessage(uid,"🎉 Premium Active");
});

/* ================= WITHDRAW ACTION ================= */
bot.action(/wok_(\d+)/, ctx=>{
 if(ctx.from!.id !== ADMIN_ID) return;

 const id = Number(ctx.match[1]);
 const w = db.prepare(
  "SELECT * FROM withdraws WHERE id=?"
 ).get(id) as any;

 if(!w || w.status!=="pending") return;

 db.prepare(
  "UPDATE users SET balance=balance-? WHERE id=?"
 ).run(w.amount, w.user_id);

 db.prepare(
  "UPDATE withdraws SET status='approved' WHERE id=?"
 ).run(id);

 bot.telegram.sendMessage(w.user_id,"✅ Withdraw Approved");
 ctx.editMessageText("Approved");
});

bot.action(/wno_(\d+)/, ctx=>{
 if(ctx.from!.id !== ADMIN_ID) return;

 db.prepare(
  "UPDATE withdraws SET status='rejected' WHERE id=?"
 ).run(Number(ctx.match[1]));

 ctx.editMessageText("Rejected");
});

/* ================= LAUNCH ================= */
bot.launch({ dropPendingUpdates:true });
console.log("Bot running...");