
-- creates a table for our own recipes
CREATE TABLE [dbo].[MyRecipes](
	[user_id][UNIQUEIDENTIFIER] NOT NULL default NEWID(),
	[recipe_id][varchar](3000) NOT NULL,
	[details][NVARCHAR](MAX) NOT NULL ,

	PRIMARY KEY (recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
)


-- user's favorites recipes: 
CREATE TABLE [dbo].[user_favorites](
	[recipe_id]          [varchar](3000)  NOT NULL,
	-- [username]           [varchar](10)    NOT NULL,
	[user_id]            [UNIQUEIDENTIFIER] NOT NULL default NEWID(),

	-- FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id),
	PRIMARY KEY (user_id, recipe_id)
)


-- user's watched recipes 
CREATE TABLE [dbo].[user_watched](
	[recipe_id]          [varchar](3000)  NOT NULL,
	-- [username]           [varchar](10)    NOT NULL,
	[user_id]            [UNIQUEIDENTIFIER] NOT NULL default NEWID(),
	[insert_time]		  [DATETIME] NOT NULL default GETDATE(),
	-- FOREIGN KEY (recipe_id) REFERENCES recipes(recipe_id),

	FOREIGN KEY (user_id) REFERENCES users(user_id),
	PRIMARY KEY (user_id, recipe_id)
)

-- creates a table for our family and self recipes
CREATE TABLE [dbo].[MyFamilyRecipes](
	[user_id][UNIQUEIDENTIFIER] NOT NULL default NEWID(),
	[recipe_id][varchar](3000) NOT NULL,
	[details][NVARCHAR](MAX) NOT NULL,

	PRIMARY KEY (recipe_id),
	FOREIGN KEY (user_id) REFERENCES users(user_id)
)

