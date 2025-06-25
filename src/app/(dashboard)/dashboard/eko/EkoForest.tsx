'use client';
import { motion } from 'framer-motion';
import Image from 'next/image';

interface EkoForestProps {
    treesPlanted: number;
    currentTreeStage: number;
}

const treeImages = {
    1: '/images/eko/seedling.svg',
    2: '/images/eko/small-tree.svg',
    3: '/images/eko/medium-tree.svg',
    4: '/images/eko/large-tree.svg',
};

// Warianty animacji dla kontenera lasu
const forestVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            // Animuj dzieci (drzewa) jedno po drugim z opóźnieniem 0.2s
            staggerChildren: 0.2,
        },
    },
};

// Warianty animacji dla pojedynczego drzewa
const treeVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
};

export function EkoForest({ treesPlanted, currentTreeStage }: EkoForestProps) {
    // Ograniczamy liczbę wyświetlanych drzew do 20, aby nie zaśmiecać widoku
    const treesToDisplay = Math.min(treesPlanted, 20);

    return (
        <motion.div
            variants={forestVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-wrap items-end justify-center gap-4 min-h-[150px]"
        >
            {/* Renderujemy w pełni wyrośnięte drzewa */}
            {Array.from({ length: treesToDisplay }).map((_, index) => (
                <motion.div key={`tree-${index}`} variants={treeVariants}>
                    <Image src="/images/eko/large-tree.svg" alt="Drzewo" width={80} height={80} />
                </motion.div>
            ))}

            {/* Renderujemy aktualnie rosnące drzewo */}
            {treesPlanted < 20 && (
                <motion.div key={`growing-tree-${treesPlanted}`} variants={treeVariants}>
                    <Image
                        src={treeImages[currentTreeStage]}
                        alt="Rosnące drzewo"
                        width={80}
                        height={80}
                        className="opacity-75"
                    />
                </motion.div>
            )}
        </motion.div>
    );
}