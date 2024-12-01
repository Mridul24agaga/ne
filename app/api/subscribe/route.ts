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
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #000;">
    <table cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff;">
        <tr>
            <td style="padding: 40px 0; text-align: center; background-color: #000;">
                <img src="https://i.imghippo.com/files/Ik4170ow.webp" alt="Logo" style="max-width: 150px;">
            </td>
        </tr>
        <tr>
            <td style="padding: 40px 30px;">
                <h1 style="color: #333333; font-size: 28px; margin-bottom: 20px;">Welcome, ${name}!</h1>
                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Thank you for subscribing to our newsletter. We're excited to have you join our community!</p>
                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Here's what you can look forward to:</p>
                <ul style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 20px; padding-left: 20px;">
                    <li>Cutting-edge tech insights</li>
                    <li>Productivity hacks and tips</li>
                    <li>Exclusive offers and early access</li>
                    <li>Industry news and trends</li>
                </ul>
                <p style="color: #666666; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">Stay tuned for our first newsletter – it's packed with valuable content you won't want to miss!</p>
                <a href="https://innvision.agency/" style="display: inline-block; background-color: #000; color: #ffffff; text-decoration: none; padding: 12px 25px; border-radius: 5px; font-size: 16px; font-weight: bold;">Explore Our Website</a>
            </td>
        </tr>
        <tr>
            <td style="background-color: #f8f8f8; padding: 30px;">
                <table cellpadding="0" cellspacing="0" width="100%">
                    <tr>
                        <td style="text-align: center; padding-bottom: 20px;">
                            <a href="https://www.linkedin.com/in/mridulthareja/" style="display: inline-block; margin: 0 10px;"><img src="https://cdn-icons-png.flaticon.com/512/174/174857.png" alt="Linkedin" style="width: 30px;"></a>
                            <a href="https://x.com/Innvisionagency" style="display: inline-block; margin: 0 10px;"><img src="https://icon2.cleanpng.com/20240119/ta/transparent-x-logo-logo-brand-identity-company-organization-black-background-white-x-logo-for-1710915881389.webp" alt="Twitter" style="width: 30px;"></a>
                        </td>
                    </tr>
                    <tr>
                        <td style="color: #999999; font-size: 14px; text-align: center;">
                            <p style="margin: 0;">© 2024 Mridul Thareja. All rights reserved.</p>
                            <p style="margin: 10px 0 0;">You're receiving this email because you signed up for our newsletter.</p>
                            <p style="margin: 10px 0 0;">Our mailing address is: hi@mridulthareja.com</p>
                        </td>
                    </tr>
                </table>
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

