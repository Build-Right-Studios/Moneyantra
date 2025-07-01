import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion'; // Import motion and useInView

const AnimatedStat = ({ finalValue, shouldAnimate }) => {
    // State to hold the current number being displayed during the animation.
    const [count, setCount] = useState(0);

    // Parse the final value string to extract the core number and any non-numeric suffix.
    const targetValue = parseFloat(finalValue.replace(/[^0-9.]/g, ''));
    const suffix = finalValue.match(/[^0-9.,]+/)?.[0] || '';
    const hasDecimal = finalValue.includes('.');

    useEffect(() => {
        if (!shouldAnimate) {
            // Reset count if animation should not occur (e.g., scrolled out of view)
            setCount(0);
            return;
        }

        // The total duration of the animation in milliseconds.
        const animationDuration = 2000;
        let startTime = null;

        // The animation loop function, which is called on each frame.
        const animateCount = (currentTime) => {
            if (!startTime) {
                startTime = currentTime;
            }

            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            const currentDisplayValue = progress * targetValue;

            setCount(currentDisplayValue);

            // If the animation is not yet complete, request the next frame.
            if (progress < 1) {
                requestAnimationFrame(animateCount);
            }
        };

        // Start the animation loop.
        const animationFrameId = requestAnimationFrame(animateCount);

        // Cleanup function to cancel the animation frame if the component unmounts or re-renders
        // due to targetValue or shouldAnimate changing.
        return () => cancelAnimationFrame(animationFrameId);
    }, [targetValue, shouldAnimate]); // Rerun the effect if targetValue or shouldAnimate changes.

    /**
     * Formats the raw count number for display.
     * - Adds commas for thousands separators for integers.
     * - Preserves one decimal place if the original value had one.
     * @param {number} val - The current count value.
     * @returns {string} The formatted number string.
     */
    const formatDisplayValue = (val) => {
        if (hasDecimal) {
            // For values like "99.8%", maintain one decimal place.
            return val.toFixed(1);
        }
        // For integer values like "25,000+", format with commas.
        return Math.floor(val).toLocaleString();
    };

    return (
        <h3 className="text-2xl font-bold">
            {formatDisplayValue(count)}{suffix}
        </h3>
    );
};

/**
 * The main statistics section component. It lays out the different stats.
 */
function StatsSection() {
    const stats = [
        { value: "1,000+", label: "Happy Users" },
        { value: "5,000+", label: "Portfolio Reviews" },
        { value: "10,000+", label: "Funds Supported" },
        { value: "45+", label: "AMCs" },
    ];

    return (
        // Main container for the stats section with original styling.
        <div className="bg-[#2f4858] p-4">
            {/* Grid layout with original height and gap. */}
            <div className="h-[80px] text-[#fbbf24] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
                {stats.map((stat, idx) => {
                    const ref = useRef(null);
                    // useInView hook: 'once: true' ensures the animation only triggers once when it enters the viewport.
                    // You can remove 'once: true' if you want the animation to re-trigger every time it comes into view.
                    const inView = useInView(ref, { once: true, amount: 0.5 }); // amount: 0.5 means 50% of the element must be visible

                    return (
                        <motion.div
                            key={idx}
                            ref={ref} // Attach the ref to the motion.div
                            initial={{ opacity: 0, y: 50 }} // Start slightly below and invisible
                            animate={inView ? { opacity: 1, y: 0 } : {}} // Animate to fully visible and in place when in view
                            transition={{ duration: 1.0, delay: idx * 0.1 }} // Stagger the animation of each stat
                        >
                            {/* Pass shouldAnimate prop to trigger the count animation */}
                            <AnimatedStat finalValue={stat.value} shouldAnimate={inView} />
                            <p className="text-gray-300 mt-1">{stat.label}</p>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}

export default StatsSection;