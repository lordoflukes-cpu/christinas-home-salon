# Deployment Guide for Christina's Home Salon

## Prerequisites

✅ Domain purchased: **christinashomesalon.co.uk** (Namecheap)
✅ Code committed to Git
⬜ GitHub account (free)
⬜ Vercel account (free)
⬜ Resend account for emails (free tier)

---

## Step 1: Push to GitHub

1. Go to [github.com](https://github.com) and sign in (or create free account)
2. Click **"New repository"** (green button, top right)
3. Repository name: `christinas-home-salon`
4. Set to **Public** or **Private** (your choice)
5. **Don't** initialize with README (you already have code)
6. Click **"Create repository"**

7. Copy the commands GitHub shows and run in your terminal:

```bash
git remote add origin https://github.com/YOUR-USERNAME/christinas-home-salon.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click **"Sign Up"** → Use **"Continue with GitHub"**
3. After signing in, click **"Add New..."** → **"Project"**
4. Find `christinas-home-salon` in the list → Click **"Import"**
5. Vercel auto-detects Next.js settings ✅
6. Click **"Deploy"** (don't change any settings yet)
7. Wait ~2 minutes for first deployment ☕

Your site is now live at: `https://christinas-home-salon.vercel.app`

---

## Step 3: Add Your Domain

### In Vercel:

1. Click on your project → **"Settings"** tab → **"Domains"**
2. Add domain: `christinashomesalon.co.uk`
3. Add domain: `www.christinashomesalon.co.uk`
4. Set `christinashomesalon.co.uk` as **Primary Domain**

Vercel will show DNS instructions. Choose **Option 1** (easiest):

### In Namecheap:

1. Go to **Domain List** → Click **"Manage"** next to christinashomesalon.co.uk
2. Find **"Nameservers"** section
3. Select **"Custom DNS"**
4. Enter these nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
5. Click **"✓ Save"**

**Wait 5-60 minutes** for DNS propagation. Then visit: https://christinashomesalon.co.uk

---

## Step 4: Set Up Email (Free Forwarding)

### In Namecheap:

1. **Domain List** → **Manage** → Find **"Email Forwarding"**
2. Click **"Add Forwarder"**
3. Mailbox: `hello`
4. Forward to: Christina's personal Gmail address
5. Click **"Add Mail Forwarder"**

Now emails sent to `hello@christinashomesalon.co.uk` will forward to Christina's Gmail.

**Note:** She can reply from her Gmail. To send FROM hello@christinashomesalon.co.uk, upgrade to Google Workspace (£5/month) later.

---

## Step 5: Environment Variables (Email Sending)

For booking confirmations to work, you need Resend:

### Get Resend API Key:

1. Go to [resend.com](https://resend.com) → Sign up (free)
2. Click **"API Keys"** → **"Create API Key"**
3. Name: `Christina's Home Salon`
4. Copy the key (starts with `re_...`)

### Add to Vercel:

1. Vercel project → **"Settings"** → **"Environment Variables"**
2. Add variable:
   - Key: `RESEND_API_KEY`
   - Value: (paste your Resend API key)
   - Environment: **Production, Preview, Development** (all checked)
3. Add variable:
   - Key: `NEXT_PUBLIC_SITE_URL`
   - Value: `https://christinashomesalon.co.uk`
   - Environment: **Production** only
4. Click **"Save"**

### Verify Domain in Resend (Important):

1. In Resend → **"Domains"** → **"Add Domain"**
2. Enter: `christinashomesalon.co.uk`
3. Resend shows DNS records to add
4. In Namecheap → **Advanced DNS** → Add the TXT/CNAME records Resend shows
5. Wait ~30 mins, then verify in Resend

Now booking emails will send from `noreply@christinashomesalon.co.uk`

---

## Step 6: Test Everything

1. Visit https://christinashomesalon.co.uk
2. Navigate to **Booking** page
3. Test the full booking flow
4. Check if email arrives at Christina's Gmail
5. Test the service area checker on homepage
6. Test enquiry form for out-of-area postcodes

---

## Updating the Website

After making changes:

```bash
git add .
git commit -m "Description of changes"
git push
```

Vercel automatically deploys updates in ~2 minutes. No manual steps needed!

---

## Costs Summary

- **Domain:** £10-12/year (christinashomesalon.co.uk)
- **Hosting (Vercel):** £0/month (free forever for this site)
- **Email forwarding:** £0 (free with Namecheap)
- **Resend emails:** £0 for first 3,000 emails/month
- **SSL Certificate:** £0 (automatic with Vercel)

**Total: ~£10-12/year** (just the domain)

---

## Need Help?

- Vercel docs: https://vercel.com/docs
- Resend docs: https://resend.com/docs
- Next.js docs: https://nextjs.org/docs

Contact Vercel support (excellent free support) via the chat icon in your Vercel dashboard.
