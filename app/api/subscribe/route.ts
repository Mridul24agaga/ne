import { NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID

export async function POST(request: Request) {
  try {
    const { name, email } = await request.json()

    if (!name || !email) {
      return NextResponse.json({ message: 'Name and email are required' }, { status: 400 })
    }

    // Check if the email already exists in Brevo
    const checkEmailResponse = await fetch(`https://api.brevo.com/v3/contacts/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'api-key': BREVO_API_KEY!
      }
    })

    if (checkEmailResponse.ok) {
      const contactData = await checkEmailResponse.json()
      
      // Check if the contact is already in the newsletter list
      if (contactData.listIds.includes(parseInt(BREVO_LIST_ID!))) {
        return NextResponse.json({ message: 'Email already subscribed' }, { status: 400 })
      }
    }

    // Add or update contact in Brevo and add to the list
    const addContactResponse = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!
      },
      body: JSON.stringify({
        email,
        attributes: { 
          FIRSTNAME: name
        },
        listIds: [parseInt(BREVO_LIST_ID!)],
        updateEnabled: true
      })
    })

    if (!addContactResponse.ok) {
      const error = await addContactResponse.json()
      throw new Error(error.message || 'Failed to add contact')
    }

    // Send welcome email
    const sendEmailResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY!
      },
      body: JSON.stringify({
        sender: {
          name: "Mridul Thareja",
          email: "hi@mridulthareja.com"
        },
        to: [{ email, name }],
        subject: "Welcome to Our Newsletter!",
        htmlContent: `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Our Newsletter!</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8f8f8; border-radius: 10px; overflow: hidden;">
    <tr>
      <td style="padding: 40px 20px; text-align: center; background-color: #6366f1;">
        <h1 style="color: #ffffff; margin: 0; font-size: 28px;">Welcome, ${name}!</h1>
      </td>
    </tr>
    <tr>
      <td style="padding: 30px 20px;">
        <p style="font-size: 18px; margin-bottom: 20px;">Thank you for subscribing to our newsletter!</p>
        <p style="font-size: 16px; margin-bottom: 20px;">We're thrilled to have you on board and can't wait to share exciting content with you. Here's what you can expect:</p>
        <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
          <li>Insightful articles on the latest tech trends</li>
          <li>Exclusive tips and tricks to boost your productivity</li>
          <li>Special offers and early access to new features</li>
        </ul>
        <p style="font-size: 16px; margin-bottom: 30px;">Stay tuned for our upcoming newsletter – it's packed with valuable content you won't want to miss!</p>
        <div style="text-align: center;">
          <a href="https://mridulthareja.com" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; font-weight: bold;">Visit Our Website</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding: 20px; text-align: center; background-color: #e5e7eb; font-size: 14px;">
        <p style="margin: 0;">Best regards,<br><strong>Mridul Thareja</strong></p>
        <p style="margin: 10px 0 0;">Follow us on: 
          <a href="#" style="color: #6366f1; text-decoration: none;">Twitter</a> | 
          <a href="#" style="color: #6366f1; text-decoration: none;">LinkedIn</a> | 
          <a href="#" style="color: #6366f1; text-decoration: none;">GitHub</a>
        </p>
      </td>
    </tr>
  </table>
</body>
</html>
`
      })
    })

    if (!sendEmailResponse.ok) {
      const error = await sendEmailResponse.json()
      throw new Error(error.message || 'Failed to send welcome email')
    }

    return NextResponse.json({ message: 'Successfully subscribed to the newsletter!' })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ message: 'Failed to subscribe. Please try again later.' }, { status: 500 })
  }
}

