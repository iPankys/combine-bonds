"use client";
import { Container, Typography } from '@mui/material';
import background from '/public/main-background.svg';
import Image from 'next/image';
import Background from '@/components/background';

export default function Home() {
    return (
        <>
            <Container maxWidth="xl" sx={{
                backgroundSize: 'cover',
                backgroundPosition: 'center',
            }}>
                <Background src={background} />
                <section>
                    <Typography variant="h1" gutterBottom>
                        Combine-Bonds
                    </Typography>
                    <Typography variant="h2" gutterBottom>
                        Stock Market Simulation
                    </Typography>
                </section>
                <section>
                    <Typography variant="h4" gutterBottom>
                        User Offers and Insights
                    </Typography>
                    {/* Add your content for the second section here */}
                </section>
                <section>
                    <Typography variant="h4" gutterBottom>
                        About the Simulation
                    </Typography>
                    {/* Add your content for the third section here */}
                </section>
            </Container>
        </>
    );
}


