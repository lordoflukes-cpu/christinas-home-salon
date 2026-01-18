# 🚀 Quick Start - Get Your Website Live!

## You've Already Done:
✅ Bought domain: **christinashomesalon.co.uk**  
✅ Code is ready and committed to Git  
✅ Updated business email in the code

---

## Next 3 Steps (15 minutes total):

### 1️⃣ Create GitHub Repository (5 min)

1. Go to **https://github.com/new**
2. Repository name: `christinas-home-salon`
3. Description: `Professional mobile hairdressing & companionship website`
4. Choose **Public** or **Private** (your choice)
5. ❌ **Don't** check "Initialize with README" (you already have code!)
6. Click **"Create repository"**

### 2️⃣ Push Code to GitHub (1 min)

After creating the repo, GitHub shows commands. Run these in your terminal (replace YOUR-USERNAME):

```bash
git remote add origin https://github.com/YOUR-USERNAME/christinas-home-salon.git
git branch -M main
git push -u origin main
```

**Or use GitHub Desktop (easier):**
- Download GitHub Desktop: https://desktop.github.com
- File → Add Local Repository → Choose this folder
- Publish Repository → Click "Publish"

### 3️⃣ Deploy to Vercel (5 min)

1. Go to **https://vercel.com**
2. Click **"Sign Up"** → **"Continue with GitHub"**
3. Click **"Add New..."** → **"Project"**
4. Find `christinas-home-salon` → Click **"Import"**
5. Click **"Deploy"** (don't change anything)
6. ☕ Wait ~2 minutes

**Your site is now LIVE at:**  
`https://christinas-home-salon.vercel.app`

---

## 🌐 Connect Your Domain (10 min)

### In Vercel:
1. Click your project → **Settings** → **Domains**
2. Add: `christinashomesalon.co.uk`
3. Add: `www.christinashomesalon.co.uk`

### In Namecheap:
1. **Domain List** → **Manage** → **Nameservers**
2. Select **"Custom DNS"**
3. Enter:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
4. Click **Save**

Wait 10-60 minutes → Visit **https://christinashomesalon.co.uk** ✨

---

## 📧 Set Up Email Forwarding (5 min)

### In Namecheap:
1. **Domain List** → **Manage** → **Email Forwarding**
2. **Add Forwarder:**
   - Mailbox: `hello`
   - Forward to: Christina's Gmail
3. Click **Save**

Now `hello@christinashomesalon.co.uk` → Christina's Gmail!

---

## 🔑 Enable Booking Emails (10 min)

### Get Resend API Key:
1. Go to **https://resend.com** → Sign up (free)
2. **API Keys** → **Create API Key**
3. Name: `Christina's Home Salon`
4. Copy the key (starts with `re_...`)

### Add to Vercel:
1. Vercel → **Settings** → **Environment Variables**
2. Add:
   - Name: `RESEND_API_KEY`
   - Value: (paste your key)
   - Check all environments
3. Add:
   - Name: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://christinashomesalon.co.uk`
   - Production only
4. Click **Save**

### Verify Domain in Resend:
1. Resend → **Domains** → **Add Domain**
2. Enter: `christinashomesalon.co.uk`
3. Copy DNS records shown
4. Namecheap → **Advanced DNS** → Add those records
5. Wait ~30 mins → Verify in Resend

Now booking confirmations work! 📬

---

## ✅ Test Everything

1. Visit **https://christinashomesalon.co.uk**
2. Try the booking flow
3. Check email arrives at Christina's Gmail
4. Test service area checker on homepage

---

## 💰 Total Cost

- Domain: **£10-12/year**
- Everything else: **FREE**

No monthly hosting fees. Ever. 🎉

---

## 📚 Full Guide

For detailed explanations, see **DEPLOYMENT.md**

## 🆘 Need Help?

- Vercel has excellent free support (chat icon in dashboard)
- GitHub docs: https://docs.github.com
- Or reach out to the developer who built this

---

**Ready? Start with Step 1 above!** 🚀
