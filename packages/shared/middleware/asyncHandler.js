/**
 * Wraps async route handlers to catch errors and forward them to Express error middleware
 * Eliminates the need for try-catch blocks in every route handler
 *
 * @param {Function} fn - Async route handler function
 * @returns {Function} Wrapped middleware function
 *
 * @example
 * // Instead of:
 * router.get('/users', async (req, res, next) => {
 *   try {
 *     const users = await userService.getAll();
 *     res.json(users);
 *   } catch (error) {
 *     next(error);
 *   }
 * });
 *
 * // Use:
 * router.get('/users', asyncHandler(async (req, res) => {
 *   const users = await userService.getAll();
 *   res.json(users);
 * }));
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
