// components/terms-of-service-template.tsx

import type React from "react"

interface TermsOfServiceTemplateProps {
  companyName: string
  websiteName?: string
  websiteUrl?: string
  effectiveDate: string
  lastUpdated?: string
  contactEmail: string
}

const TermsOfServiceTemplate: React.FC<TermsOfServiceTemplateProps> = ({
  companyName,
  websiteName = "My Lindy AI Platform",
  websiteUrl = "https://mylindy.com",
  effectiveDate,
  lastUpdated,
  contactEmail,
}) => {
  return (
    <div className="prose prose-blue max-w-none dark:prose-invert">
      <p>Last Updated: {lastUpdated || effectiveDate}</p>

      <p>
        Welcome to {websiteName} by {companyName}! These Terms of Service ("Terms") govern your use of our website,
        products, and services (collectively, the "Service"). By accessing or using the Service, you agree to be bound
        by these Terms. If you do not agree to these Terms, you may not access or use the Service.
      </p>

      <h2>1. Acceptance of Terms</h2>
      <p>
        By accessing or using the Service, you agree to be bound by these Terms and all applicable laws and regulations.
        If you do not agree with any of these terms, you are prohibited from using or accessing the Service.
      </p>

      <h2>2. Description of Service</h2>
      <p>
        {websiteName} provides an AI assistant platform that helps businesses automate workflows, manage customer
        relationships, process documents, and integrate with various business tools. Our service includes AI-powered
        features such as document parsing, form generation, email management, calendar scheduling, and integrations with
        popular business applications.
      </p>

      <h2>3. User Accounts</h2>
      <p>
        To access certain features of the Service, you may be required to create an account. You are responsible for
        maintaining the confidentiality of your account credentials and for all activities that occur under your
        account. You agree to notify us immediately of any unauthorized access to or use of your account.
      </p>

      <h2>4. User Content</h2>
      <p>
        You are solely responsible for any content that you submit, post, or display on or through the Service ("User
        Content"). You retain ownership of your User Content. By submitting, posting, or displaying User Content, you
        grant us a non-exclusive, worldwide, royalty-free license to use, reproduce, modify, adapt, publish, translate,
        distribute, and display your User Content in connection with the Service.
      </p>

      <h2>5. AI Data Processing</h2>
      <p>
        When you interact with our AI assistant, your prompts and queries may be processed by third-party AI model
        providers (such as OpenAI, Anthropic, and others). We implement strict data handling protocols to protect your
        information:
      </p>
      <ul>
        <li>We do not use your data to train third-party AI models without your explicit consent</li>
        <li>Sensitive business data is processed with enhanced security measures</li>
        <li>We maintain audit logs of AI interactions for security and improvement purposes</li>
        <li>You can request deletion of your AI interaction history at any time</li>
      </ul>

      <h2>6. Prohibited Conduct</h2>
      <p>You agree not to engage in any of the following prohibited activities:</p>
      <ul>
        <li>Violating any applicable law or regulation</li>
        <li>Interfering with or disrupting the Service</li>
        <li>Impersonating any person or entity</li>
        <li>Collecting or harvesting any information about other users</li>
        <li>Uploading or transmitting viruses or other malicious code</li>
        <li>Using the Service for any illegal or unauthorized purpose</li>
        <li>Attempting to gain unauthorized access to the Service or related systems</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <p>
        The Service and its original content, features, and functionality are owned by {companyName}
        and are protected by copyright, trademark, and other intellectual property laws. The My Lindy name, logo, and
        all related names, logos, product and service names, designs, and slogans are trademarks of {companyName} or its
        affiliates.
      </p>

      <h2>8. Third-Party Services</h2>
      <p>
        Our AI assistant platform integrates with various third-party services to provide comprehensive business
        automation. These include AI Model Providers (OpenAI, Anthropic, Grok), Integration Partners (Zapier, Twilio,
        OpenPhone), Cloud Infrastructure (AWS, Microsoft Azure), and Analytics Services.
      </p>
      <p>
        Each integration is governed by the respective third party's privacy policy and terms of service. We recommend
        reviewing these policies for services you choose to connect.
      </p>

      <h2>9. Disclaimer of Warranties</h2>
      <p>
        THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING
        BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT. WE
        DO NOT WARRANT THAT THE SERVICE WILL BE UNINTERRUPTED, TIMELY, SECURE, OR ERROR-FREE.
      </p>

      <h2>10. Limitation of Liability</h2>
      <p>
        IN NO EVENT SHALL {companyName.toUpperCase()} BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR
        PUNITIVE DAMAGES ARISING OUT OF OR IN CONNECTION WITH THE SERVICE, WHETHER BASED ON WARRANTY, CONTRACT, TORT
        (INCLUDING NEGLIGENCE), OR ANY OTHER LEGAL THEORY, EVEN IF WE HAVE BEEN ADVISED OF THE POSSIBILITY OF SUCH
        DAMAGES.
      </p>

      <h2>11. Indemnification</h2>
      <p>
        You agree to indemnify and hold {companyName} harmless from any and all claims, damages, liabilities, costs, and
        expenses arising out of or in connection with your use of the Service or your violation of these Terms.
      </p>

      <h2>12. Termination</h2>
      <p>
        We may terminate or suspend your access to the Service immediately, without prior notice or liability, for any
        reason whatsoever, including without limitation if you breach the Terms. Upon termination, your right to use the
        Service will immediately cease.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms shall be governed and construed in accordance with the laws of the State of Delaware, United States,
        without regard to its conflict of law provisions, as Strawberry Antler, Inc. is incorporated in Delaware. Our
        failure to enforce any right or provision of these Terms will not be considered a waiver of those rights. If any
        provision of these Terms is held to be invalid or unenforceable by a court, the remaining provisions of these
        Terms will remain in effect. These Terms constitute the entire agreement between us regarding our Service, and
        supersede and replace any prior agreements we might have had between us regarding the Service.
      </p>

      <h2>14. Changes to Terms</h2>
      <p>
        We reserve the right to modify or replace these Terms at any time at our sole discretion. If a revision is
        material, we will provide at least 30 days' notice prior to any new terms taking effect. What constitutes a
        material change will be determined at our sole discretion. By continuing to access or use our Service after any
        revisions become effective, you agree to be bound by the revised terms.
      </p>

      <h2>15. Contact Us</h2>
      <p>
        If you have any questions about these Terms, please contact {companyName} at{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>

      <p>Effective Date: {effectiveDate}</p>
    </div>
  )
}

export default TermsOfServiceTemplate
