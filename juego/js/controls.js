(() => {
    function setupControls(game, actions) {
        const joystick = document.getElementById("joystick");
        const joystickStick = document.getElementById("joystickStick");
        let activePointer = null;
        const deadzoneRatio = 0.15;

        function resetJoystick() {
            game.joystickX = 0;
            game.joystickY = 0;
            if (joystickStick) {
                joystickStick.style.left = "50%";
                joystickStick.style.top = "50%";
            }
        }

        function updateJoystick(event) {
            if (!joystick || !joystickStick) return;

            const rect = joystick.getBoundingClientRect();
            const maxDistance = rect.width * 0.32;
            if (maxDistance <= 0) return;

            let dx = event.clientX - (rect.left + rect.width / 2);
            let dy = event.clientY - (rect.top + rect.height / 2);
            const distance = Math.hypot(dx, dy);
            const deadzone = maxDistance * deadzoneRatio;

            if (distance > maxDistance) {
                dx = (dx / distance) * maxDistance;
                dy = (dy / distance) * maxDistance;
            }

            const clampedDistance = Math.min(distance, maxDistance);
            const inputStrength = clampedDistance <= deadzone
                ? 0
                : ((clampedDistance - deadzone) / (maxDistance - deadzone)) * 0.45;
            const directionX = dx / (clampedDistance || 1);
            const directionY = dy / (clampedDistance || 1);
            game.joystickX = directionX * inputStrength;
            game.joystickY = directionY * inputStrength;
            joystickStick.style.left = `${50 + game.joystickX * 32}%`;
            joystickStick.style.top = `${50 + game.joystickY * 32}%`;
        }

        if (joystick) {
            joystick.addEventListener("pointerdown", event => {
                event.preventDefault();
                activePointer = event.pointerId;
                joystick.setPointerCapture(event.pointerId);
                updateJoystick(event);
            });

            joystick.addEventListener("pointermove", event => {
                if (event.pointerId === activePointer) {
                    event.preventDefault();
                    updateJoystick(event);
                }
            });

            const releaseJoystick = event => {
                if (event.pointerId !== activePointer) return;
                activePointer = null;
                resetJoystick();
            };
            joystick.addEventListener("pointerup", releaseJoystick);
            joystick.addEventListener("pointercancel", releaseJoystick);
            joystick.addEventListener("lostpointercapture", releaseJoystick);
        }

        const keyMap = {
            w: "up",
            ArrowUp: "up",
            s: "down",
            ArrowDown: "down",
            a: "left",
            ArrowLeft: "left",
            d: "right",
            ArrowRight: "right"
        };

        window.addEventListener("keydown", event => {
            const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
            const direction = keyMap[key];
            if (direction) {
                game.keys[direction] = true;
                if (key.startsWith("Arrow")) event.preventDefault();
            }

            if (event.repeat) return;
            if (event.code === "Space") {
                event.preventDefault();
                actions.dash();
            } else if (key === "k") {
                actions.areaAttack();
            } else if (key === "l") {
                actions.lunge();
            } else if (key === "i") {
                actions.slowEnemies();
            }
        });

        window.addEventListener("keyup", event => {
            const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
            const direction = keyMap[key];
            if (direction) game.keys[direction] = false;
        });

        window.addEventListener("blur", () => {
            Object.keys(game.keys).forEach(key => {
                game.keys[key] = false;
            });
            activePointer = null;
            resetJoystick();
        });

        const buttonActions = [
            ["dashButton", actions.dash],
            ["areaButton", actions.areaAttack],
            ["lungeButton", actions.lunge],
            ["slowButton", actions.slowEnemies]
        ];

        for (const [id, action] of buttonActions) {
            const button = document.getElementById(id);
            if (button) {
                button.addEventListener("click", event => {
                    event.preventDefault();
                    action();
                });
            }
        }
    }

    window.ShadowMaze = window.ShadowMaze || {};
    window.ShadowMaze.Input = { setupControls };
})();
