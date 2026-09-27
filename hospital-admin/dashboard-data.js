<script>
(function () {

    const user = JSON.parse(localStorage.getItem("hospitalos_user") || "{}");
    const hospital = JSON.parse(localStorage.getItem("hospitalos_hospital") || "{}");
    const subscription = JSON.parse(localStorage.getItem("hospitalos_subscription") || "{}");
    const stats = JSON.parse(localStorage.getItem("hospitalos_stats") || "{}");

    function findAndSet(text, value) {
        const elements = document.querySelectorAll("*");

        for (const el of elements) {
            if (el.children.length === 0 && el.textContent.trim() === text) {
                el.textContent = value;
                return true;
            }
        }

        return false;
    }

    // Header
    findAndSet("Hospital Admin", user.name || "Hospital Admin");
    findAndSet("hospital_admin", user.role || "hospital_admin");

    // Hospital name
    findAndSet(
        "Gopal Joshi Hospital",
        stats.hospitalName || hospital.name || "Gopal Joshi Hospital"
    );

    // Dashboard numbers
    findAndSet(
        "-",
        String(stats.departments ?? 12)
    );

    findAndSet(
        "-",
        String(stats.enabledFeatures ?? 12)
    );

    findAndSet(
        "-",
        subscription.plan
            ? subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)
            : "Professional"
    );

    findAndSet(
        "-",
        String(subscription.maxUsers ?? 100)
    );

})();
</script>
