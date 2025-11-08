/**
 * Corporate Enquiry Form Handler
 * Handles form submission for corporate and group experience enquiries
 */

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('corporateEnquiryForm');

    if (!form) {
        console.log('Corporate enquiry form not found on this page');
        return;
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get submit button and disable it
        const submitBtn = form.querySelector('.submit-btn');
        const originalBtnText = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        try {
            // Get form data
            const formData = new FormData(e.target);
            const data = Object.fromEntries(formData);

            // Validate required fields
            if (!data.company || !data.contact_name || !data.email || !data.experience_type || !data.details) {
                alert('Please fill in all required fields.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                return;
            }

            // Check if Supabase client is available
            if (!window.supabaseClient) {
                console.error('Supabase client not initialized');
                alert('Service not available. Please try again later or contact us directly.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                return;
            }

            // Prepare data for insertion
            const insertData = {
                company: data.company.trim(),
                contact_name: data.contact_name.trim(),
                email: data.email.trim().toLowerCase(),
                phone: data.phone ? data.phone.trim() : null,
                experience_type: data.experience_type,
                group_size: data.group_size ? parseInt(data.group_size) : null,
                details: data.details.trim(),
                source: 'Corporate Page',
                site: 'henrik'
            };

            console.log('Submitting corporate enquiry:', insertData);

            // Submit to Supabase
            const { error } = await window.supabaseClient
                .from('corporate_inquiries')
                .insert([insertData]);

            if (error) {
                console.error('Error submitting corporate enquiry:', error);
                alert('Sorry, there was an error submitting your enquiry. Please try again or contact us directly.');
                submitBtn.disabled = false;
                submitBtn.textContent = originalBtnText;
                return;
            }

            // Success
            console.log('Corporate enquiry submitted successfully');
            e.target.reset();

            // Show success message
            alert('Thank you! We\'ll be in touch within 24 hours to discuss your vision.');

            // Re-enable button
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;

        } catch (err) {
            console.error('Unexpected error:', err);
            alert('An unexpected error occurred. Please try again.');
            submitBtn.disabled = false;
            submitBtn.textContent = originalBtnText;
        }
    });

    // Add real-time validation feedback
    const emailField = form.querySelector('#email');
    if (emailField) {
        emailField.addEventListener('blur', () => {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailField.value && !emailRegex.test(emailField.value)) {
                emailField.setCustomValidity('Please enter a valid email address');
                emailField.reportValidity();
            } else {
                emailField.setCustomValidity('');
            }
        });
    }

    // Add character counter for details field
    const detailsField = form.querySelector('#details');
    if (detailsField) {
        detailsField.addEventListener('input', () => {
            const charCount = detailsField.value.length;
            if (charCount < 20 && charCount > 0) {
                detailsField.setCustomValidity('Please provide more details (at least 20 characters)');
            } else {
                detailsField.setCustomValidity('');
            }
        });
    }
});
