"use client";

import {
  useEffect,
  useRef,
  useState,
  createElement,
  useMemo,
  useCallback,
} from "react";
import { gsap } from "gsap";

const TextType = ({
  text,
  as: Component = "div",
  typingSpeed = 50,
  initialDelay = 0,
  pauseDuration = 2000,
  deletingSpeed = 30,
  loop = true,
  className = "",
  showCursor = true,
  hideCursorWhileTyping = false,
  cursorCharacter = "|",
  cursorClassName = "",
  cursorBlinkDuration = 0.5,
  textColors = [],
  variableSpeed,
  onSentenceComplete,
  onTextUpdate,
  startOnVisible = false,
  reverseMode = false,
  ...props
}) => {
  const [displayedText, setDisplayedText] = useState("");
  const [currentCharIndex, setCurrentCharIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(!startOnVisible);
  const cursorRef = useRef(null);
  const containerRef = useRef(null);
  const completionCalledRef = useRef(false);
  const hasStartedRef = useRef(false);
  const lastTextRef = useRef(null);

  const textArray = useMemo(
    () => (Array.isArray(text) ? text : [text]),
    [text]
  );

  // // Initialize onTextUpdate with empty string
  // useEffect(() => {
  //   if (
  //     onTextUpdate &&
  //     displayedText === "" &&
  //     currentCharIndex === 0 &&
  //     !isDeleting
  //   ) {
  //     onTextUpdate("");
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  const onSentenceCompleteRef = useRef(onSentenceComplete);
  const onTextUpdateRef = useRef(onTextUpdate);

  useEffect(() => {
    onSentenceCompleteRef.current = onSentenceComplete;
    onTextUpdateRef.current = onTextUpdate;
  }, [onSentenceComplete, onTextUpdate]);

  const getRandomSpeed = useCallback(() => {
    if (!variableSpeed) return typingSpeed;
    const { min, max } = variableSpeed;
    return Math.random() * (max - min) + min;
  }, [variableSpeed, typingSpeed]);

  const getCurrentTextColor = () => {
    if (textColors.length === 0) return;
    return textColors[currentTextIndex % textColors.length];
  };

  useEffect(() => {
    if (!startOnVisible || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [startOnVisible]);

  useEffect(() => {
    if (showCursor && cursorRef.current) {
      gsap.set(cursorRef.current, { opacity: 1 });
      gsap.to(cursorRef.current, {
        opacity: 0,
        duration: cursorBlinkDuration,
        repeat: -1,
        yoyo: true,
        ease: "power2.inOut",
      });
    }
  }, [showCursor, cursorBlinkDuration]);

  useEffect(() => {
    if (!isVisible) return;

    // Prevent double execution in React Strict Mode
    const currentTextKey = JSON.stringify(textArray);
    const isTextChanged = lastTextRef.current !== currentTextKey;

    // If we've already started and text hasn't changed, don't restart (Strict Mode remount)
    if (
      hasStartedRef.current &&
      !isTextChanged &&
      displayedText === "" &&
      currentCharIndex === 0 &&
      !isDeleting
    ) {
      return;
    }

    // Update last text reference
    if (isTextChanged) {
      lastTextRef.current = currentTextKey;
      hasStartedRef.current = false; // Reset on text change
    }

    // Mark as started when we begin typing
    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      hasStartedRef.current = true;
    }

    let timeout;
    const currentText = textArray[currentTextIndex];
    const processedText = reverseMode
      ? currentText.split("").reverse().join("")
      : currentText;

    const executeTypingAnimation = () => {
      if (isDeleting) {
        if (displayedText === "") {
          setIsDeleting(false);
          if (currentTextIndex === textArray.length - 1 && !loop) {
            return;
          }

          if (onSentenceComplete) {
            onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
          }

          setCurrentTextIndex((prev) => (prev + 1) % textArray.length);
          setCurrentCharIndex(0);
          completionCalledRef.current = false; // Reset for next text
          timeout = setTimeout(() => {}, pauseDuration);
        } else {
          timeout = setTimeout(() => {
            setDisplayedText((prev) => {
              const newText = prev.slice(0, -1);
              if (onTextUpdate) {
                onTextUpdate(newText);
              }
              return newText;
            });
          }, deletingSpeed);
        }
      } else {
        if (currentCharIndex < processedText.length) {
          timeout = setTimeout(
            () => {
              setDisplayedText((prev) => {
                const newText = prev + processedText[currentCharIndex];
                if (onTextUpdate) {
                  onTextUpdate(newText);
                }
                return newText;
              });
              setCurrentCharIndex((prev) => prev + 1);
            },
            variableSpeed ? getRandomSpeed() : typingSpeed
          );
        } else {
          // Text is fully typed
          if (
            onSentenceComplete &&
            !completionCalledRef.current &&
            currentCharIndex >= processedText.length &&
            displayedText.length >= processedText.length
          ) {
            completionCalledRef.current = true;
            // Use a small delay to ensure state is updated
            timeout = setTimeout(() => {
              onSentenceComplete(textArray[currentTextIndex], currentTextIndex);
            }, 100);
          }
          if (textArray.length > 1) {
            timeout = setTimeout(() => {
              setIsDeleting(true);
              completionCalledRef.current = false; // Reset for next text
            }, pauseDuration);
          }
        }
      }
    };

    if (currentCharIndex === 0 && !isDeleting && displayedText === "") {
      timeout = setTimeout(executeTypingAnimation, initialDelay);
    } else {
      executeTypingAnimation();
    }

    return () => {
      clearTimeout(timeout);
      // Reset hasStartedRef only on unmount if text is empty (Strict Mode cleanup)
      if (displayedText === "" && currentCharIndex === 0 && !isDeleting) {
        hasStartedRef.current = false;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    currentCharIndex,
    displayedText,
    isDeleting,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    textArray,
    currentTextIndex,
    loop,
    initialDelay,
    isVisible,
    reverseMode,
    variableSpeed,
    onSentenceComplete,
  ]);

  const shouldHideCursor =
    hideCursorWhileTyping &&
    (currentCharIndex < textArray[currentTextIndex].length || isDeleting);

  return (
    <>
      <style>{`
        .text-type {
          display: inline-block;
          white-space: pre-wrap;
        }
        
        .text-type__cursor {
          margin-left: 0.25rem;
          display: inline-block;
          opacity: 1;
        }
        
        .text-type__cursor--hidden {
          display: none;
        }
      `}</style>
      {createElement(
        Component,
        {
          ref: containerRef,
          className: `text-type ${className}`,
          ...props,
        },
        <span
          className="text-type__content"
          style={{ color: getCurrentTextColor() || "inherit" }}
        >
          {displayedText}
        </span>,
        showCursor && (
          <span
            ref={cursorRef}
            className={`text-type__cursor ${cursorClassName} ${
              shouldHideCursor ? "text-type__cursor--hidden" : ""
            }`}
          >
            {cursorCharacter}
          </span>
        )
      )}
    </>
  );
};

export default TextType;
