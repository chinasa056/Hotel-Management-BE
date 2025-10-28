export const basePdfTemplate = (
  title: string,
  content: string,
  logoUrl: string = 'https://via.placeholder.com/150x60?text=LOGO',
  hotelName: string = 'Grand Hotel',
  contact: string = 'contact@grandhotel.com | +1 234 567 890'
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    :root {
      --primary: #1E40AF;
      --light: #EFF6FF;
      --white: #FFFFFF;
      --dark: #1E293B;
      --gray: #64748B;
    }
    body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; background: var(--light); }
    .container { max-width: 800px; margin: 40px auto; background: var(--white); border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1); }
    .header { background: var(--primary); color: white; padding: 20px; text-align: center; }
    .logo { height: 60px; margin-bottom: 10px; }
    .title { margin: 0; font-size: 24px; font-weight: 600; }
    .content { padding: 30px; color: var(--dark); line-height: 1.6; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { background: var(--light); color: var(--primary); padding: 12px; text-align: left; font-weight: 600; }
    td { padding: 10px 12px; border-bottom: 1px solid #e2e8f0; }
    .footer { background: #f8fafc; padding: 20px; text-align: center; color: var(--gray); font-size: 12px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <img src="${logoUrl}" alt="Hotel Logo" class="logo" />
      <h1 class="title">${title}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Generated on ${new Date().toLocaleString()} • ${hotelName} • ${contact}</p>
    </div>
  </div>
</body>
</html>
`;