interface PrivacyPolicyTemplateProps {
  companyName: string
  websiteUrl: string
  contactEmail: string
  contactAddress: string
  lastUpdated: string
  includeGDPR?: boolean
  includeCCPA?: boolean
  includeCookies?: boolean
  includeAnalytics?: boolean
  includeThirdPartyServices?: string[]
}

export default function PrivacyPolicyTemplate({
  companyName,
  websiteUrl,
  contactEmail,
  contactAddress,
  lastUpdated,
  includeGDPR = true,
  includeCCPA = true,
  includeCookies = true,
  includeAnalytics = true,
  includeThirdPartyServices = [],
}: PrivacyPolicyTemplateProps) {
  return (
    <div className="prose prose-blue max-w-none dark:prose-invert">
      <p>Last Updated: {lastUpdated}</p>

      <p>
        At {companyName}, the company behind Lindy AI, we take your privacy seriously. This Privacy Policy explains how
        we collect, use, disclose, and safeguard your information when you visit our website {websiteUrl} and use our AI
        assistant services. Please read this privacy policy carefully. If you do not agree with the terms of this
        privacy policy, please do not access our website or use our services.
      </p>

      <h2>About Our Service</h2>
      <p>
        Lindy is an intelligent AI assistant platform that helps businesses automate workflows, manage customer
        relationships, process documents, and integrate with various business tools. Our service includes AI-powered
        features such as document parsing, form generation, email management, calendar scheduling, and integrations with
        popular business applications.
      </p>

      <h2>Information We Collect</h2>
      <p>
        We collect information that you provide directly to us when you register for an account, create or modify your
        profile, set preferences, sign-up for or make purchases through our AI assistant services. This information may
        include:
      </p>
      <ul>
        <li>Personal identifiers (name, email address, phone number)</li>
        <li>Account credentials (username, password)</li>
        <li>Billing information (credit card details, billing address)</li>
        <li>Business information (company name, size, industry)</li>
        <li>AI interaction data (prompts, queries, commands sent to our AI assistant)</li>
        <li>Document content (when using our document parsing and processing features)</li>
        <li>Integration data (information from connected third-party services)</li>
        <li>Usage data (features used, interaction patterns, AI model preferences)</li>
        <li>Communication records (emails, calendar events processed by our AI)</li>
      </ul>

      <h2>How We Use Your Information</h2>
      <p>We may use the information we collect for various purposes, including to:</p>
      <ul>
        <li>Provide, maintain, and improve our AI assistant services</li>
        <li>Process AI requests and generate responses through our integrated AI models</li>
        <li>Parse and process documents, forms, and business data as requested</li>
        <li>Facilitate integrations with third-party business applications</li>
        <li>Process transactions and send related information</li>
        <li>Send administrative messages, updates, security alerts, and support messages</li>
        <li>Respond to your comments, questions, and requests</li>
        <li>Personalize your AI assistant experience and improve response accuracy</li>
        <li>Train and improve our AI models (only with your explicit consent)</li>
        <li>Monitor and analyze trends, usage, and activities in connection with our services</li>
        <li>Detect, investigate, and prevent fraudulent transactions and other illegal activities</li>
        <li>Comply with legal obligations</li>
      </ul>

      <h2>AI Data Processing</h2>
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

      <h2>Data Storage and Security</h2>
      <p>
        We implement appropriate technical and organizational measures to protect the security of your personal
        information and business data. However, please be aware that no security measures are perfect or impenetrable,
        and we cannot guarantee the security of your data transmitted to our services.
      </p>
      <p>
        Your data is stored on secure cloud servers with industry-standard encryption. We maintain strict access
        controls, regular security audits, and compliance with enterprise security standards to protect your
        information. All data transmission uses industry-standard encryption protocols.
      </p>

      <h2>Data Retention</h2>
      <p>
        We retain personal information for as long as necessary to fulfill the purposes outlined in this privacy policy,
        unless a longer retention period is required or permitted by law. For AI interaction data, we typically retain
        this information for service improvement purposes, but you can request deletion at any time. We will retain and
        use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our
        agreements.
      </p>

      <h2>Sharing Your Information</h2>
      <p>We may share your information in the following situations:</p>
      <ul>
        <li>
          <strong>With AI Model Providers:</strong> We may share prompts and queries with third-party AI providers
          (OpenAI, Anthropic, etc.) to generate responses, but we implement strict data protection agreements.
        </li>
        <li>
          <strong>With Integration Partners:</strong> When you connect third-party services, we may share relevant data
          to facilitate those integrations (e.g., Zapier, Twilio, calendar applications).
        </li>
        <li>
          <strong>With Service Providers:</strong> We may share your information with third-party vendors, service
          providers, contractors, or agents who perform services for us under strict confidentiality agreements.
        </li>
        <li>
          <strong>Business Transfers:</strong> We may share or transfer your information in connection with, or during
          negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our
          business.
        </li>
        <li>
          <strong>With Your Consent:</strong> We may disclose your information for any other purpose with your consent.
        </li>
        <li>
          <strong>Legal Requirements:</strong> We may disclose your information where required to do so by law or in
          response to valid requests by public authorities.
        </li>
      </ul>

      {includeThirdPartyServices.length > 0 && (
        <>
          <h2>Third-Party Services</h2>
          <p>
            Our AI assistant platform integrates with various third-party services to provide comprehensive business
            automation. These include:
          </p>
          <ul>
            {includeThirdPartyServices.map((service, index) => (
              <li key={index}>{service}</li>
            ))}
          </ul>
          <p>
            Each integration is governed by the respective third party's privacy policy and terms of service. We
            recommend reviewing these policies for services you choose to connect.
          </p>
        </>
      )}

      {includeCookies && (
        <>
          <h2>Cookies and Tracking Technologies</h2>
          <p>
            We use cookies and similar tracking technologies to track activity on our services and hold certain
            information. Cookies are files with a small amount of data that may include an anonymous unique identifier.
          </p>
          <p>We use cookies for the following purposes:</p>
          <ul>
            <li>To maintain your authenticated session and AI assistant preferences</li>
            <li>To understand how you use our AI services and which features are most valuable</li>
            <li>To enhance the security of our services and prevent unauthorized access</li>
            <li>To personalize your AI assistant experience and remember your settings</li>
            <li>To analyze the effectiveness of our AI features and business integrations</li>
          </ul>
          <p>
            You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if
            you do not accept cookies, you may not be able to use some portions of our AI assistant services.
          </p>
        </>
      )}

      {includeAnalytics && (
        <>
          <h2>Analytics</h2>
          <p>
            We may use third-party Service Providers to monitor and analyze the use of our AI assistant services. These
            services help us understand how users interact with our AI features, which business integrations are most
            popular, and how users navigate through our platform. This information is used to improve our AI
            capabilities and user experience.
          </p>
        </>
      )}

      <h2>Your Privacy Rights</h2>
      <p>Depending on your location, you may have certain rights regarding your personal information, including:</p>
      <ul>
        <li>The right to access personal information we hold about you</li>
        <li>The right to request correction of inaccurate personal information</li>
        <li>The right to request deletion of your personal information and AI interaction history</li>
        <li>The right to object to processing of your personal information</li>
        <li>The right to data portability (export your data in a machine-readable format)</li>
        <li>The right to withdraw consent for AI model training or data processing</li>
        <li>The right to opt-out of certain AI features or integrations</li>
      </ul>

      {includeGDPR && (
        <>
          <h3>GDPR Privacy Rights (For European Economic Area Residents)</h3>
          <p>
            If you are a resident of the European Economic Area (EEA), you have certain data protection rights under the
            General Data Protection Regulation (GDPR). We aim to take reasonable steps to allow you to correct, amend,
            delete, or limit the use of your Personal Information.
          </p>
          <p>Under the GDPR, you have the following specific rights:</p>
          <ul>
            <li>The right to access, update or delete the information we have on you</li>
            <li>
              The right of rectification - the right to have your information corrected if it is inaccurate or
              incomplete
            </li>
            <li>The right to object to our processing of your Personal Information</li>
            <li>
              The right of restriction - the right to request that we restrict the processing of your personal
              information
            </li>
            <li>
              The right to data portability - the right to be provided with a copy of your Personal Information in a
              structured, machine-readable and commonly used format
            </li>
            <li>
              The right to withdraw consent at any time where we relied on your consent to process your personal
              information, including consent for AI model training
            </li>
          </ul>
          <p>
            To exercise these rights, please contact us using the contact information provided at the end of this
            Privacy Policy.
          </p>
        </>
      )}

      {includeCCPA && (
        <>
          <h3>CCPA Privacy Rights (For California Residents)</h3>
          <p>
            If you are a California resident, you have specific rights regarding your personal information under the
            California Consumer Privacy Act (CCPA). This section describes your CCPA rights and explains how to exercise
            those rights.
          </p>
          <p>Under the CCPA, you have the following rights:</p>
          <ul>
            <li>The right to know about the personal information we collect about you and how it is used and shared</li>
            <li>The right to delete personal information collected from you (with certain exceptions)</li>
            <li>The right to opt-out of the sale of your personal information</li>
            <li>The right to non-discrimination for exercising your CCPA rights</li>
          </ul>
          <p>
            Note: We do not sell your personal information to third parties. However, some of our AI integrations may be
            considered "sharing" under CCPA definitions.
          </p>
          <p>
            To exercise these rights, please contact us using the contact information provided at the end of this
            Privacy Policy.
          </p>
        </>
      )}

      <h2>Children's Privacy</h2>
      <p>
        Our AI assistant services are not intended for individuals under the age of 16. We do not knowingly collect
        personal information from children under 16. If we learn we have collected or received personal information from
        a child under 16 without verification of parental consent, we will delete that information.
      </p>

      <h2>International Data Transfers</h2>
      <p>
        Your information may be transferred to, and maintained on, computers located outside of your state, province,
        country, or other governmental jurisdiction where the data protection laws may differ from those in your
        jurisdiction. This includes transfers to AI model providers and cloud infrastructure providers.
      </p>
      <p>
        If you are located outside the United States and choose to provide information to us, please note that we
        transfer the data to the United States and process it there. We implement appropriate safeguards to protect your
        data during international transfers. Your consent to this Privacy Policy followed by your submission of such
        information represents your agreement to that transfer.
      </p>

      <h2>Changes to This Privacy Policy</h2>
      <p>
        We may update our Privacy Policy from time to time to reflect changes in our AI services, legal requirements, or
        business practices. We will notify you of any material changes by posting the new Privacy Policy on this page
        and updating the "Last updated" date at the top of this Privacy Policy.
      </p>
      <p>
        You are advised to review this Privacy Policy periodically for any changes. Changes to this Privacy Policy are
        effective when they are posted on this page.
      </p>

      <h2>Contact Us</h2>
      <p>
        If you have any questions about this Privacy Policy, our AI data processing practices, or wish to exercise your
        privacy rights, please contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
      {contactAddress && <address style={{ whiteSpace: "pre-line" }}>{contactAddress}</address>}
    </div>
  )
}
