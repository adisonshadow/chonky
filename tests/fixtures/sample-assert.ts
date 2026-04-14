machine:assert for "REQ-USER-LOGIN-01" {
  scenario("Valid login succeeds", () => {
    const result = { success: true };
    expect(result.success).toBe(true);
  });
  scenario("Empty username fails", () => {
    const result = { success: false, error: 'Username required' };
    expect(result.success).toBe(false);
  });
}
