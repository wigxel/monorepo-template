import { relations } from "drizzle-orm";
import {
	doublePrecision,
	foreignKey,
	index,
	integer,
	pgEnum,
	pgTable,
	serial,
	text,
	timestamp,
	uniqueIndex,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { randomUUID } from "uncrypto";

export const publishStatus = pgEnum("PublishStatus", [
	"PUBLISHED",
	"DRAFT",
	"UNPUBLISHED",
]);

export const memberRole = pgEnum("MemberRole", ["ADMIN", "OWNER", "CREATOR"]);

export const user = pgTable(
	"User",
	{
		count: serial("count").notNull(),
		email: text("email").notNull(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		createdAt: timestamp("created_at", {
			precision: 6,
			withTimezone: true,
			mode: "string",
		})
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", {
			precision: 6,
			withTimezone: true,
			mode: "string",
		}),
		id: text("id")
			.primaryKey()
			.unique()
			.notNull()
			.references(() => userMeta.userId, {
				onDelete: "restrict",
				onUpdate: "cascade",
			})
			.$default(() => randomUUID()),
		password: text("password").default("").notNull(),
	},
	(table) => {
		return {
			emailKey: uniqueIndex("User_email_key").on(table.email),
		};
	},
);

export const userRelations = relations(user, ({ one, many }) => ({
	Meta: one(userMeta, {
		fields: [user.id],
		references: [userMeta.userId],
	}),
	Favourite: many(favourite),
	Session: many(sessionCustomer),
}));

export const recipe = pgTable("Recipe", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$default(() => randomUUID()),
	serving: integer("serving").notNull(),
	cookingTime: integer("cooking_time").notNull(),
	createdAt: timestamp("created_at", { precision: 3, mode: "string" })
		.defaultNow()
		.notNull(),
	serial: serial("serial").notNull(),
	updatedAt: timestamp("updated_at", {
		precision: 3,
		mode: "string",
	}).notNull(),
});

export const recipeRelations = relations(recipe, ({ many }) => ({
	MealToRecipe: many(mealToRecipe),
	RecipeStep: many(recipeStep),
	RecipeIngredient: many(recipeIngredient),
}));

export const favourite = pgTable("Favourite", {
	id: serial("id").primaryKey().notNull(),
	mealId: text("mealId")
		.notNull()
		.references(() => meal.id, { onDelete: "restrict", onUpdate: "cascade" }),
	userId: text("userId")
		.notNull()
		.references(() => user.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
});

export const favouriteRelations = relations(favourite, ({ one, many }) => ({
	User: one(user, {
		fields: [favourite.userId],
		references: [user.id],
	}),
	Meal: one(meal, {
		fields: [favourite.mealId],
		references: [meal.id],
	}),
}));

export const category = pgTable(
	"Category",
	{
		id: serial("id").primaryKey().notNull(),
		label: text("label").notNull(),
	},
	(table) => {
		return {
			labelKey: uniqueIndex("Category_label_key").on(table.label),
		};
	},
);

export const categoryRelations = relations(category, ({ one, many }) => ({
	Meals: many(meal),
}));

export const measurement = pgTable(
	"Measurement",
	{
		id: serial("id").primaryKey().notNull(),
		unit: text("unit").notNull(),
		siUnit: text("si_unit").notNull(),
		siUnitPlural: text("si_unit_plural").default("").notNull(),
		unitPlural: text("unit_plural").default("").notNull(),
	},
	(table) => {
		return {
			unitKey: uniqueIndex("Measurement_unit_key").on(table.unit),
			siUnitKey: uniqueIndex("Measurement_si_unit_key").on(table.siUnit),
		};
	},
);

export const measurementRelations = relations(measurement, ({ one, many }) => ({
	RecipeIngredient: many(recipeIngredient),
}));

export const ingredient = pgTable(
	"Ingredient",
	{
		id: serial("id").primaryKey().notNull(),
		name: text("name").notNull(),
	},
	(table) => {
		return {
			nameKey: uniqueIndex("Ingredient_name_key").on(table.name),
		};
	},
);

export const ingredientRelations = relations(ingredient, ({ one, many }) => ({
	RecipeIngredient: many(recipeIngredient),
}));

export const recipeIngredient = pgTable(
	"RecipeIngredient",
	{
		id: serial("id").primaryKey().notNull(),
		quantity: doublePrecision("quantity").notNull(),
		measurementId: integer("measurementId")
			.notNull()
			.references(() => measurement.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		ingredientId: integer("ingredientId")
			.notNull()
			.references(() => ingredient.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
		alternativeOfId: integer("alternativeOfId"),
		recipeId: text("recipeId")
			.notNull()
			.references(() => recipe.id, {
				onDelete: "restrict",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			recipeIngredientAlternativeOfIdFkey: foreignKey({
				columns: [table.alternativeOfId],
				foreignColumns: [table.id],
				name: "RecipeIngredient_alternativeOfId_fkey",
			})
				.onUpdate("cascade")
				.onDelete("set null"),
		};
	},
);

export const recipeIngredientRelations = relations(
	recipeIngredient,
	({ one, many }) => ({
		Measurement: one(measurement, {
			fields: [recipeIngredient.measurementId],
			references: [measurement.id],
		}),
		Ingredient: one(ingredient, {
			fields: [recipeIngredient.ingredientId],
			references: [ingredient.id],
		}),
		Recipe: one(recipe, {
			fields: [recipeIngredient.recipeId],
			references: [recipe.id],
		}),
		AltOf: one(recipeIngredient, {
			relationName: "AlternativeIngredients",
			fields: [recipeIngredient.alternativeOfId],
			references: [recipeIngredient.id],
		}),
		Alts: many(recipeIngredient, { relationName: "AlternativeIngredients" }),
	}),
);

export const recipeStep = pgTable("RecipeStep", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$default(() => randomUUID()),
	image: text("image").notNull(),
	order: integer("order").notNull(),
	caption: text("caption").notNull(),
	paragraph: text("paragraph").notNull(),
	recipeId: text("recipeId").references(() => recipe.id, {
		onDelete: "set null",
		onUpdate: "cascade",
	}),
	serial: serial("serial").notNull(),
});

export const recipeStepRelations = relations(recipeStep, ({ one, many }) => ({
	Recipe: one(recipe, {
		fields: [recipeStep.recipeId],
		references: [recipe.id],
	}),
}));

export const meal = pgTable(
	"Meal",
	{
		id: text("id")
			.primaryKey()
			.notNull()
			.$default(() => randomUUID()),
		description: text("description").notNull(),
		status: publishStatus("status").notNull(),
		createdAt: timestamp("created_at", { precision: 3, mode: "string" })
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", { precision: 3, mode: "string" }),
		videoUrl: text("video_url").notNull(),
		name: text("name").notNull(),
		serial: serial("serial").notNull(),
	},
	(table) => {
		return {
			nameKey: uniqueIndex("Meal_name_key").on(table.name),
		};
	},
);

export const mealRelations = relations(meal, ({ many }) => ({
	MealToRecipe: many(mealToRecipe),
	Favourite: many(favourite),
	CategoryToMeal: many(categoryToMeal),
}));

export const mealToRecipe = pgTable(
	"_MealToRecipe",
	{
		a: text("A")
			.notNull()
			.references(() => meal.id, { onDelete: "cascade", onUpdate: "cascade" }),
		b: text("B")
			.notNull()
			.references(() => recipe.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
	},
	(table) => {
		return {
			bIdx: index().on(table.b),
			abUnique: uniqueIndex("_MealToRecipe_AB_unique").on(table.a, table.b),
		};
	},
);

export const mealToRecipeRelations = relations(mealToRecipe, ({ one }) => {
	return {
		Meal: one(meal, {
			fields: [mealToRecipe.a],
			references: [meal.id],
		}),
		Recipe: one(recipe, {
			fields: [mealToRecipe.b],
			references: [recipe.id],
		}),
	};
});

export const categoryToMeal = pgTable(
	"_CategoryToMeal",
	{
		a: integer("A")
			.notNull()
			.references(() => category.id, {
				onDelete: "cascade",
				onUpdate: "cascade",
			}),
		b: text("B")
			.notNull()
			.references(() => meal.id, { onDelete: "cascade", onUpdate: "cascade" }),
	},
	(table) => {
		return {
			abUnique: uniqueIndex("_CategoryToMeal_AB_unique").on(table.a, table.b),
			bIdx: index().on(table.b),
		};
	},
);

export const categoryToMealRelations = relations(categoryToMeal, ({ one }) => ({
	Category: one(category, {
		fields: [categoryToMeal.a],
		references: [category.id],
	}),
	Meal: one(meal, {
		fields: [categoryToMeal.b],
		references: [meal.id],
	}),
}));

export const userMeta = pgTable("UserMeta", {
	userId: text("user_id").notNull(),
	onboardedAt: timestamp("onboarded_at", {
		withTimezone: true,
		mode: "string",
	}),
});

export const userMetaRelations = relations(userMeta, ({ many }) => ({
	User: many(user),
}));

export const question = pgTable("Question", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$default(() => randomUUID()),
	type: text("type").notNull(),
	text: text("text").notNull(),
	status: publishStatus("status").default("DRAFT").notNull(),
});

export const questionRelations = relations(question, ({ many }) => ({
	options: many(questionOption),
}));

export const teamMember = pgTable(
	"TeamMember",
	{
		id: text("id").primaryKey().notNull(),
		firstName: text("first_name").notNull(),
		lastName: text("last_name").notNull(),
		email: text("email").notNull(),
		role: memberRole("role").notNull(),
		createdAt: timestamp("created_at", {
			precision: 6,
			withTimezone: true,
			mode: "string",
		})
			.defaultNow()
			.notNull(),
		updatedAt: timestamp("updated_at", {
			precision: 6,
			withTimezone: true,
			mode: "string",
		}),
		password: text("password").default("").notNull(),
		deletedAt: timestamp("deleted_at", {
			precision: 6,
			withTimezone: true,
			mode: "string",
		}),
	},
	(table) => {
		return {
			emailKey: uniqueIndex("TeamMember_email_key").on(table.email),
		};
	},
);

export const teamMemberRelations = relations(teamMember, ({ one, many }) => ({
	Session: many(sessionOrg),
}));

export const sessionOrg = pgTable("SessionOrg", {
	id: text("id").primaryKey().notNull(),
	userId: text("user_id")
		.notNull()
		.references(() => teamMember.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	expiresAt: timestamp("expiresAt").notNull(),
});

export const sessionOrgRelations = relations(sessionOrg, ({ one, many }) => ({
	TeamMember: one(teamMember, {
		fields: [sessionOrg.userId],
		references: [teamMember.id],
	}),
}));

export const sessionCustomer = pgTable("SessionCustomer", {
	id: text("id").primaryKey().notNull(),
	userId: text("userId")
		.notNull()
		.references(() => user.id, {
			onDelete: "cascade",
			onUpdate: "cascade",
		}),
	expiresAt: timestamp("expiresAt").notNull(),
});

export const sessionCustomerRelations = relations(
	sessionCustomer,
	({ one, many }) => ({
		TeamMember: one(user, {
			fields: [sessionCustomer.userId],
			references: [user.id],
		}),
	}),
);

export const questionOption = pgTable("QuestionOption", {
	id: text("id")
		.primaryKey()
		.notNull()
		.$default(() => randomUUID()),
	text: text("text").notNull(),
	image: text("image"),
	questionId: text("questionId")
		.notNull()
		.references(() => question.id, {
			onDelete: "restrict",
			onUpdate: "cascade",
		}),
});

export const questionOptionRelations = relations(
	questionOption,
	({ one, many }) => ({
		TeamMember: one(question, {
			fields: [questionOption.questionId],
			references: [question.id],
		}),
	}),
);
