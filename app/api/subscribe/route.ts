import { NextResponse } from 'next/server'

const BREVO_API_KEY = process.env.BREVO_API_KEY
const BREVO_LIST_ID = process.env.BREVO_LIST_ID
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://mridulthareja.com'

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
      
      // Check if the contact is in the newsletter list and has confirmed
      const isInList = contactData.listIds.includes(parseInt(BREVO_LIST_ID!))
      const isConfirmed = contactData.attributes.DOUBLE_OPT_IN === true

      if (isInList && isConfirmed) {
        return NextResponse.json({ message: 'Email already subscribed' }, { status: 400 })
      } else if (isInList && !isConfirmed) {
        return NextResponse.json({ message: 'Please check your inbox for the confirmation email' }, { status: 400 })
      }
    }

    // If email doesn't exist or isn't in the list, proceed with subscription process
    const confirmationToken = Buffer.from(`${email}:${Date.now()}`).toString('base64')

    // Add contact to Brevo without adding to list or confirming
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
          FIRSTNAME: name,
          DOUBLE_OPT_IN: false,
          CONFIRMATION_TOKEN: confirmationToken
        },
        updateEnabled: true
      })
    })

    if (!addContactResponse.ok) {
      const error = await addContactResponse.json()
      throw new Error(error.message || 'Failed to add contact')
    }

    // Send confirmation email
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
        subject: "Confirm your subscription",
        htmlContent: `
          <html>
            <body>
              <h1>Hello ${name},</h1>
              <p>Thank you for subscribing to our newsletter!</p>
              <p>Please click the button below to confirm your subscription:</p>
              <a href="${APP_URL}/api/confirm?token=${encodeURIComponent(confirmationToken)}" 
                 style="background-color: #6366f1; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Confirm Subscription
              </a>
            </body>
          </html>
        `
      })
    })

    if (!sendEmailResponse.ok) {
      const error = await sendEmailResponse.json()
      throw new Error(error.message || 'Failed to send confirmation email')
    }

    return NextResponse.json({ message: 'Please check your email to confirm your subscription.' })
  } catch (error) {
    console.error('Subscription error:', error)
    return NextResponse.json({ message: 'Failed to subscribe. Please try again later.' }, { status: 500 })
  }
}

