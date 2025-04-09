    if (action === "unban") {
      await new Promise<void>((resolve, reject) => {
        db.run(
          `UPDATE Players SET banned_until = NULL WHERE steam_id = ?`,
          [steam_id],
          (err) => (err ? reject(err) : resolve())
        );
      });
      closeDatabase(db);
      return { success: true, message: "Player unbanned successfully" };
    }